# 4. Implementacija aplikacije u Angular-u 22+

U prethodnom poglavlju definisani su funkcionalni zahtevi aplikacije Faculty Service, odnosno skup funkcija koje aplikacija treba da pruži studentima i administratorima. U ovom poglavlju prikazana je njihova konkretna realizacija u Angular-u 22. Pažnja je usmerena na organizaciju projekta, način povezivanja komponenti, servisa i repozitorijuma, kao i na upravljanje stanjem i učitavanjem podataka.

Aplikacija je organizovana kao klijentska web aplikacija čija je osnovna namena objedinjavanje više fakultetskih usluga na jednom mestu. Student kroz aplikaciju može da pregleda obaveštenja, prati finansijsko stanje, vidi plan rata, prijavljuje ispite i upravlja svojim profilom. Administrator ima dodatne mogućnosti, kao što su kreiranje, izmena i brisanje vesti, pregled finansijskih podataka drugih studenata i upravljanje finansijskim transakcijama.

Za razvoj aplikacije korišćeni su Angular 22, TypeScript, Angular Material, RxJS i SCSS. Projekat je zasnovan na standalone komponentama, bez klasične organizacije pomoću Angular modula. Podaci se u trenutnoj verziji aplikacije obezbeđuju preko mock repozitorijuma, čime je omogućeno testiranje funkcionalnosti pre povezivanja sa stvarnim serverskim API-jem.

## 4.1. Inicijalizacija projekta i konfiguracija okruženja

Projekat je inicijalizovan pomoću Angular CLI alata, uz korišćenje Angular verzije 22. Osnovna konfiguracija projekta nalazi se u datotekama `angular.json`, `tsconfig.json`, `tsconfig.app.json` i `package.json`. U datoteci `package.json` definisane su zavisnosti projekta, među kojima se nalaze Angular biblioteke, Angular Material, RxJS i alati za testiranje.

Angular Material je korišćen za izgradnju standardizovanih elemenata korisničkog interfejsa, kao što su dugmad, forme, padajuće liste, meniji, dijalozi i bočna navigacija. Na taj način je obezbeđen ujednačen izgled aplikacije i smanjena potreba za implementacijom osnovnih elemenata interfejsa od početka.

Ulazna tačka aplikacije nalazi se u datoteci `main.ts`, gde se pokreće Angular aplikacija i učitava konfiguracija definisana u `app.config.ts`. U ovoj konfiguraciji registrovan je Angular Router, kao i globalni mehanizmi za obradu grešaka u pregledaču. Rute aplikacije definisane su u datoteci `app.routes.ts`.

Rute su organizovane tako da javni deo aplikacije obuhvata prijavu korisnika, dok je ostatak funkcionalnosti dostupan samo nakon uspešne autentifikacije. Za tu namenu koriste se tri tipa zaštitnih mehanizama:

- `guestGuard` sprečava prijavljenog korisnika da ponovo otvara stranicu za prijavu;
- `authGuard` štiti stranice koje su dostupne samo autentifikovanim korisnicima;
- `adminGuard` ograničava administratorske funkcije na korisnike sa administratorskom ulogom.

Pored zaštite pristupa, rute koriste i lenjo učitavanje komponenti. Kod stranica kao što su finansijski pregled, registracija ispita i upravljanje vestima, komponenta se učitava tek kada korisnik otvori odgovarajuću rutu. Ovo smanjuje količinu koda koja se učitava pri pokretanju aplikacije i omogućava jasnije razdvajanje funkcionalnih celina.

Za izgradnju projekta koristi se Angular build sistem. Razvojna konfiguracija omogućava source map fajlove i isključuje optimizaciju, dok produkciona konfiguracija uključuje optimizaciju i proveru veličine izlaznih fajlova. Stilovi su pisani u SCSS-u, što omogućava organizaciju stilova kroz promenljive, ugnježdene selektore i izdvojene datoteke po komponentama.

## 4.2. Standalone komponente i organizacija funkcionalnih celina

Aplikacija koristi standalone pristup uveden u novijim verzijama Angular-a. Svaka komponenta samostalno navodi biblioteke i druge komponente koje koristi kroz svoj `imports` niz. Na primer, stranica za finansijski pregled direktno uvozi Angular Material module, `ReactiveFormsModule`, `RouterLink` i module potrebne za prikaz dijaloga i menija.

Ovakva organizacija ima nekoliko prednosti. Zavisnosti komponente vidljive su na jednom mestu, komponente su jednostavnije za izdvajanje i testiranje, a struktura projekta ne zavisi od velikih funkcionalnih modula. Takođe, standalone komponente se dobro uklapaju sa lenjim učitavanjem putem rutiranja.

Struktura aplikacije podeljena je na nekoliko osnovnih celina:

- `core` sadrži funkcionalnosti koje se koriste u celoj aplikaciji, kao što su autentifikacija, guard komponente, modeli korisnika i početni mock podaci;
- `features` sadrži poslovne funkcionalnosti aplikacije, odnosno početnu stranicu, vesti, finansije i prijavu ispita;
- `layout` obuhvata glavnu strukturu stranice, bočnu navigaciju, gornju alatnu traku i podnožje;
- `shared` sadrži komponente koje se koriste na više mesta, kao što su indikator učitavanja, dijaloški prozor za potvrdu i servis za akcije u podnožju;
- `models` sadrži tipove podataka koji se koriste u različitim delovima aplikacije.

Svaka funkcionalna celina uglavnom ima sopstvenu stranicu, servis i repozitorijum. Na primer, funkcionalnost vesti obuhvata `NewsPageComponent`, `CreateNewsPageComponent`, `NewsService` i `MockNewsRepository`. Sličan obrazac koristi se i za finansijski modul i modul za prijavu ispita.

## 4.3. Implementacija layout-a aplikacije

Glavni layout aplikacije realizovan je komponentom `MainLayoutComponent`. Ova komponenta predstavlja zajednički okvir za sve stranice dostupne prijavljenom korisniku. U okviru layout-a nalaze se:

- gornja alatna traka;
- bočna navigacija;
- centralni deo za prikaz stranice;
- dinamičko podnožje sa akcijama.

Centralni deo koristi `router-outlet`, u koji se učitava komponenta aktivne rute. Na taj način `MainLayoutComponent` ostaje isti tokom kretanja kroz aplikaciju, dok se menja samo sadržaj centralnog dela.

Bočna navigacija omogućava pristup početnoj stranici, vestima, finansijama, prijavi ispita i profilu korisnika. Prikaz pojedinih navigacionih stavki zavisi od uloge korisnika. Administratorske funkcije, kao što su kreiranje vesti ili dodavanje finansijske transakcije, nisu dostupne običnom studentu.

Za akcije koje zavise od trenutno otvorene stranice koristi se `PageFooterService`. Stranice mogu da registruju dugmad u podnožju, na primer dugme za čuvanje obrasca, otkazivanje operacije, prijavu ispita ili plaćanje neizmirenih obaveza. Kada se komponenta uništi, ona čisti prethodno registrovane akcije. Time se sprečava da akcije sa jedne stranice ostanu vidljive na drugoj.

Globalni indikator učitavanja povezan je sa događajima Angular Router-a. Prilikom početka navigacije prikazuje se indikator, a nakon završetka, otkazivanja ili greške u navigaciji indikator se uklanja. Na taj način korisnik dobija povratnu informaciju da je aplikacija obradila njegov zahtev.

### Predlog mesta za sliku

**Slika 4.1. Osnovni layout aplikacije sa gornjom trakom, bočnom navigacijom i centralnim sadržajem**

> Ovde umetnuti screenshot glavnog layout-a aplikacije.

### 4.3.1. Implementacija početne stranice

Početna stranica predstavlja početni pregled najvažnijih informacija za prijavljenog korisnika. Realizovana je komponentom `HomePageComponent`, koja koristi `AuthService`, `NewsService` i `FinancialService`.

Na početnoj stranici prikazuju se:

- ime prijavljenog korisnika;
- najvažnije vesti;
- trenutno finansijsko dugovanje;
- informacija o narednoj obavezi.

Vesti koje se prikazuju na početnoj stranici filtriraju se prema kategoriji `IMPORTANT`. Za prikaz finansijskog dela koriste se metode finansijskog servisa koje izračunavaju trenutno dugovanje i pronalaze sledeću ratu. Ukoliko ne postoji sledeće dugovanje, korisniku se prikazuje poruka da su sve obaveze izmirene.

Klikom na važnu vest korisnik se preusmerava na stranicu sa vestima. Identifikator vesti prosleđuje se kroz query parametar `expanded`, nakon čega se odgovarajuća kartica automatski otvara i pozicionira u okviru stranice.

Ovakav pristup omogućava da početna stranica ostane pregledna i da ne ponavlja sve funkcije pojedinačnih modula. Njena uloga je da korisniku ponudi kratak pregled stanja i omogući brz pristup detaljima.

### Predlog mesta za sliku

**Slika 4.2. Početna stranica aplikacije sa pregledom važnih vesti i finansijskog stanja**

> Ovde umetnuti screenshot početne stranice.

### 4.3.2. Implementacija modula za vesti

Modul za vesti obuhvata prikaz vesti za sve prijavljene korisnike i administratorske operacije nad sadržajem. Prikaz vesti realizovan je komponentom `NewsPageComponent`, dok se kreiranje i izmena obavljaju kroz `CreateNewsPageComponent`.

Vesti se prikazuju u obliku kartica. Za svaku vest prikazuju se naslov, sažetak, sadržaj, kategorija, datum objavljivanja i informacija o autoru. Duži sadržaj se inicijalno prikazuje kao skraćeni tekst. Korisnik može da proširi karticu i prikaže ceo tekst. Identifikatori proširenih vesti čuvaju se u skupu `expandedNewsIds`.

Administratorske akcije prikazane su samo ako prijavljeni korisnik ima ulogu administratora. Na kartici vesti administrator može da izabere izmenu ili brisanje. Brisanje se ne izvršava odmah, već se prvo otvara dijalog za potvrdu. Ovakav pristup smanjuje mogućnost slučajnog brisanja sadržaja.

#### 4.3.2.1. Prikaz, kreiranje, izmena i brisanje vesti

Forma za kreiranje i izmenu vesti zasnovana je na reaktivnim Angular formama. Forma sadrži sledeća polja:

- naslov;
- sažetak;
- sadržaj;
- kategoriju;
- oznaku da li je vest zakačena, odnosno istaknuta.

Polja naslova, sažetka i sadržaja imaju validator `required`. Kategorija se bira iz unapred definisanih vrednosti: opšta vest, akademska vest, događaj i važna vest. U zavisnosti od rute, ista komponenta radi u režimu kreiranja ili izmena. Ako ruta sadrži identifikator vesti, postojeći podaci se učitavaju i postavljaju u formu pomoću metode `patchValue`.

Pre čuvanja proverava se validnost forme. Ako forma nije validna, sva polja se označavaju kao dodirnuta, čime se korisniku prikazuju poruke o grešci. Nakon uspešnog čuvanja korisnik se vraća na stranicu sa vestima.

Kreiranje, izmena i brisanje se ne izvršavaju direktno u komponenti. Komponenta poziva metode `NewsService` servisa, koji dalje koristi `MockNewsRepository`. Repozitorijum menja kolekciju mock podataka i vraća rezultat u obliku RxJS observable-a.

#### 4.3.2.2. Osvežavanje podataka nakon izmene

Nakon uspešnog kreiranja, izmene ili brisanja vesti, servis poziva `reload()` metode `rxResource` objekta. Na ovaj način se ponovo izvršava učitavanje podataka, a signal povezan sa resursom dobija ažuriranu vrednost.

Ovakvo rešenje je značajno zato što komponenta ne mora ručno da menja lokalnu listu vesti nakon svake operacije. Servis ostaje odgovoran za učitavanje i osvežavanje podataka, dok komponenta samo koristi vrednost signala `news`.

### Predlog mesta za sliku

**Slika 4.3. Prikaz modula za vesti**

> Ovde umetnuti screenshot stranice sa listom vesti.

**Slika 4.4. Forma za kreiranje i izmenu vesti**

> Ovde umetnuti screenshot forme za kreiranje ili izmenu vesti.

## 4.4. Implementacija finansijskog modula

Finansijski modul predstavlja jednu od složenijih funkcionalnih celina aplikacije. Njegova implementacija obuhvata pregled transakcija, izračunavanje salda, plan rata i administratorsko upravljanje transakcijama.

Glavna stranica modula realizovana je komponentom `FinancialOverviewComponent`. Prikaz stranice zavisi od uloge korisnika. Student vidi sopstvene finansijske podatke, dok administrator najpre može da pronađe studenta i zatim otvori njegov finansijski pregled.

Administrator može da pretražuje studente prema imenu, imejlu ili studentskom broju. Rezultati pretrage se izračunavaju pomoću computed vrednosti `filteredStudents`. Nakon izbora studenta, prikazuje se pregled njegovih obaveza i transakcija.

### 4.4.1. Pregled transakcija i obračun salda

Finansijski servis izdvaja transakcije za konkretnog studenta i sortira ih prema datumu dospeća. Na osnovu tipa transakcije izračunavaju se:

- ukupno zaduženje;
- ukupno uplaćen iznos;
- trenutno dugovanje.

U obračun ukupnog zaduženja ulaze transakcije čiji tip nije `PAYMENT`. Uplaćeni iznos obuhvata samo transakcije tipa `PAYMENT` koje imaju status `PAID`. Trenutno dugovanje računa se kao razlika između ukupnog zaduženja i ukupno uplaćenog iznosa, pri čemu se rezultat ograničava na nulu.

Na korisničkom interfejsu ove vrednosti prikazane su kroz kartice sa metrikama. Pored iznosa, prikazuje se i procenat uplaćenog dela školarine, kao i informacija o sledećem datumu dospeća.

Transakcije su prikazane u tabeli. Tabela sadrži identifikator, datum, opis, tip i iznos transakcije. Uplate se vizuelno razlikuju od zaduženja, a administratoru su dostupne dodatne akcije za izmenu i brisanje.

### 4.4.2. Plan rata i statusi uplata

Plan rata se formira u metodi `getPaymentPlan`. U trenutnoj verziji aplikacije plan obuhvata dvanaest rata, pri čemu se za svaku ratu određuju redni broj, datum dospeća, iznos i status.

Status rate može biti:

- `PAID`, ako postoji odgovarajuća plaćena transakcija;
- `OVERDUE`, ako je transakcija označena kao dospela ili je datum dospeća prošao;
- `PENDING`, ako rata još nije plaćena, a datum dospeća nije prošao.

Za svaku ratu prikazuje se datum dospeća, iznos i datum uplate, ukoliko postoji. Plan je prikazan u obliku mreže kartica, što omogućava brz pregled svih dvanaest rata.

Na osnovu plana rata određuje se i sledeća neizmirena obaveza. Ona se koristi na početnoj stranici, u finansijskom pregledu i u tekstualnoj oznaci statusa, kao što su „Pending payment“, „Overdue“ ili „All settled“.

### 4.4.3. Administratorske operacije nad transakcijama

Administrator može da kreira novu transakciju, izmeni postojeću ili je obriše. Za kreiranje i izmenu koristi se `FinancialTransactionFormComponent`.

Forma sadrži opis transakcije, iznos, tip, status, datum dospeća i broj rate. Obavezna polja su opis, iznos i datum dospeća. Iznos mora biti veći od nule, što se obezbeđuje validatorom `Validators.min(1)`.

Kao i kod vesti, ista komponenta koristi se za kreiranje i izmenu. Režim rada određuje se na osnovu identifikatora transakcije u ruti. Ako se uređuje postojeća transakcija, podaci se učitavaju iz servisa i postavljaju u formu.

Brisanje transakcije zahteva prethodnu potvrdu kroz dijalog. Nakon uspešne operacije servis osvežava finansijski resurs, a komponenta povećava lokalni signal za osvežavanje prikaza. Studentu je dostupna i akcija „Pay all outstanding“, kojom se sve neizmirene rate označavaju kao plaćene ili se za njih kreiraju odgovarajuće transakcije.

### Predlog mesta za sliku

**Slika 4.5. Finansijski pregled studenta**

> Ovde umetnuti screenshot finansijskog pregleda sa metrikama i stanjem duga.

**Slika 4.6. Plan rata i statusi uplata**

> Ovde umetnuti screenshot plana rata.

**Slika 4.7. Tabela finansijskih transakcija sa administratorskim akcijama**

> Ovde umetnuti screenshot tabele transakcija.

**Slika 4.8. Forma za kreiranje i izmenu finansijske transakcije**

> Ovde umetnuti screenshot forme za transakciju.

## 4.5. Servisi, repozitorijumi i razdvajanje odgovornosti

Servisi u aplikaciji služe kao veza između komponenti i sloja za pristup podacima. Komponente su zadužene za prikaz podataka i reakciju na korisničke akcije, dok servisi sadrže poslovnu logiku i pozivaju repozitorijume.

U aplikaciji postoje posebni servisi za autentifikaciju, vesti, finansije i prijavu ispita. Na primer, `NewsService` poziva metode `MockNewsRepository` repozitorijuma, dok `FinancialService` koristi `MockFinancialRepository`.

Repozitorijumi predstavljaju sloj koji direktno pristupa podacima. U trenutnoj verziji koriste se mock podaci iz objekta `FACULTY_MOCK_DATA`. Metode repozitorijuma vraćaju `Observable` vrednosti pomoću funkcije `of`, čime se simulira asinkroni rad budućeg HTTP sloja.

Ovakvo razdvajanje je značajno zato što se prelazak na pravi backend može izvršiti uz manje promene. Umesto mock repozitorijuma moguće je uvesti HTTP repozitorijum koji koristi `HttpClient`, dok bi javne metode servisa i komponente mogle ostati iste.

Servisi takođe sadrže poslovna pravila. Finansijski servis, na primer, ne samo da učitava transakcije, već i obračunava saldo, generiše plan rata i određuje status sledeće obaveze. Na taj način se logika ne ponavlja u različitim komponentama.

## 4.6. Signals, computed vrednosti i reaktivno stanje

Angular signals koriste se kao osnovni mehanizam za upravljanje reaktivnim stanjem. Signal predstavlja vrednost koju Angular prati i na čiju promenu može automatski da reaguje.

U aplikaciji se signals koriste za:

- trenutno prijavljenog korisnika;
- status učitavanja;
- poruku o grešci pri prijavi;
- izabranog studenta;
- tekst pretrage;
- izabranu ispitnu sesiju;
- okidače za osvežavanje podataka.

Za vrednosti koje zavise od drugih vrednosti koristi se `computed`. Na primer, `isAdmin` zavisi od trenutno prijavljenog korisnika, dok `balance`, `paymentPlan` i `nextDue` zavise od izabranog studenta i trenutnog stanja transakcija.

Na finansijskoj stranici computed vrednosti omogućavaju da se izabrani student promeni bez ručnog osvežavanja cele stranice. Kada se promeni `selectedStudentId`, ponovo se izračunavaju student, saldo, plan rata i lista transakcija.

Za slučajeve u kojima se podaci zasnivaju na promeni signala koristi se i pomoćni `refreshTrigger`. Nakon operacije nad transakcijom, vrednost ovog signala se povećava, čime se aktiviraju computed vrednosti koje od njega zavise.

`AuthService` takođe koristi signal za trenutno prijavljenog korisnika. Komponente ne pristupaju direktno repozitorijumu za autentifikaciju, već koriste javne signale i metode servisa. Time se stanje autentifikacije održava na jednom mestu.

## 4.7. Učitavanje podataka pomoću rxResource mehanizma

Za učitavanje podataka iz observable izvora koristi se `rxResource` mehanizam iz `@angular/core/rxjs-interop`. U `NewsService` servisu resurs je definisan tako da poziva `getNews()` metodu repozitorijuma. Sličan pristup koristi se i u `FinancialService` servisu za učitavanje finansijskih transakcija.

Vrednost resursa izložena je kroz signal. Komponenta zato ne mora ručno da upravlja promenljivom koja predstavlja listu podataka. Umesto toga, koristi signal koji se automatski ažurira nakon učitavanja ili ponovnog učitavanja resursa.

Nakon uspešnog dodavanja, izmene ili brisanja podataka poziva se `reload()`. Na primer, metode `createNews`, `updateNews` i `deleteNews` koriste RxJS operator `tap` da bi nakon završene operacije ponovo učitale vesti.

Ovaj način rada omogućava jednostavniju sinhronizaciju prikaza i izvora podataka. Nakon izmene korisnik dobija stanje koje odgovara trenutnom sadržaju repozitorijuma, bez potrebe da komponenta ručno dodaje ili uklanja element iz lokalne kolekcije.

Pošto trenutna verzija koristi mock repozitorijume, podaci se učitavaju odmah. Ipak, struktura je pripremljena za rad sa asinkronim HTTP zahtevima, gde bi `rxResource` upravljao učitavanjem podataka sa servera.

## 4.8. Obrasci, validacija i obrada grešaka

Obrasci u aplikaciji implementirani su pomoću Angular reaktivnih formi. Ovaj pristup omogućava da se struktura forme, tipovi podataka i validatori definišu u TypeScript kodu, dok se u HTML šablonu forma povezuje pomoću direktiva.

Forma za prijavu korisnika koristi validatore `required` i `email`. Forma za kreiranje vesti zahteva unos naslova, sažetka i sadržaja. Finansijska forma proverava obavezna polja i minimalnu vrednost iznosa. Dugmad za čuvanje u formama onemogućena su dok forma nije validna.

Pre izvršavanja operacije dodatno se proverava stanje forme. Ako je forma nevalidna, poziva se `markAllAsTouched`, čime se korisniku prikazuju greške i bez prethodnog fokusa na svako polje.

Greške i nevalidna stanja obrađuju se na više nivoa. Neispravni podaci za prijavu prikazuju se kroz poruku koju postavlja `AuthService`. Ako se pokuša otvaranje nepostojeće vesti ili transakcije, korisnik se vraća na odgovarajuću listu. Administratorske operacije za brisanje zaštićene su dijalogom za potvrdu.

Kod prijave ispita koristi se `MatSnackBar` za prikaz rezultata operacije. Ako ispit više nije dostupan ili je kapacitet popunjen, korisniku se prikazuje odgovarajuća poruka. Nakon uspešne prijave ili otkazivanja, prikazuje se obaveštenje i ažurira se prikaz podataka.

U narednoj fazi razvoja, kada se mock repozitorijumi zamene HTTP repozitorijumima, obrada grešaka može se proširiti na mrežne greške, istek sesije i greške servera. Osnovna organizacija servisa i repozitorijuma već omogućava da se takva obrada uvede bez značajnog menjanja prezentacionih komponenti.

## 4.9. Testiranje komponenti i osnovnih korisničkih scenarija

Testiranje je realizovano pomoću Angular testnog okruženja i Vitest test runner-a. Testovi komponenti proveravaju da li se komponenta može kreirati u okviru Angular testnog modula i da li su njene osnovne zavisnosti pravilno povezane.

Testovi postoje za aplikaciju, početnu stranicu, stranicu za prijavu, indikator učitavanja, bočnu navigaciju i alatnu traku. Osnovni test komponente proverava da li je instanca uspešno kreirana. Ovakav test predstavlja početnu proveru ispravne konfiguracije komponente i njenih importovanih zavisnosti.

Pored testova kreiranja komponenti, važno je testirati i osnovne korisničke scenarije:

1. korisnik otvara stranicu za prijavu;
2. unosi neispravne podatke i dobija poruku o grešci;
3. prijavljuje se sa odgovarajućim nalogom;
4. otvara početnu stranicu;
5. pregleda važne vesti;
6. otvara finansijski pregled;
7. administrator bira studenta i pregleda njegove transakcije;
8. administrator kreira, menja ili briše vest;
9. student bira dostupnu ispitnu sesiju i potvrđuje prijavu;
10. korisnik se odjavljuje i vraća na stranicu za prijavu.

Posebnu pažnju treba posvetiti testiranju izračunavanja finansijskog salda, određivanja statusa rate i osvežavanja podataka nakon izmena. Takođe je potrebno proveriti da se administratorske kontrole ne prikazuju studentima i da zaštićene rute odbijaju pristup korisnicima bez odgovarajuće uloge.

Na ovaj način testovi ne proveravaju samo tehničko kreiranje komponenti, već i ponašanje aplikacije u scenarijima koji direktno proizlaze iz funkcionalnih zahteva definisanih u prethodnom poglavlju. Posebno je korisno izdvojiti poslovna pravila finansijskog i ispitnog modula u zasebne testove, jer njihova ispravnost nije vezana za konkretan izgled stranice.

## Zaključak poglavlja

Implementacija aplikacije Faculty Service zasnovana je na jasnom razdvajanju prikaza, poslovne logike i pristupa podacima. Standalone komponente omogućavaju jednostavnu organizaciju funkcionalnih celina, dok servisi i repozitorijumi sprečavaju direktno mešanje poslovnih pravila sa prezentacionim kodom.

Signals i `computed` vrednosti koriste se za održavanje reaktivnog stanja, dok `rxResource` obezbeđuje kontrolisano učitavanje i osvežavanje podataka. Reaktivne forme omogućavaju validaciju korisničkog unosa, a guard komponente ograničavaju pristup funkcijama u skladu sa ulogom korisnika.

Iako se trenutna verzija oslanja na mock repozitorijume, struktura aplikacije je pripremljena za povezivanje sa stvarnim backend servisom. Zadržavanjem istih servisa i modela, moguće je zameniti izvor podataka bez promene glavnih korisničkih tokova i layout-a aplikacije.
