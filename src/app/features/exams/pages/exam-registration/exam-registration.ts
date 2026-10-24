import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { FACULTY_MOCK_DATA } from '../../../../core/mocks/faculty.mock';
import { ExamRegistration, ExamSession } from '../../../../models/faculty.model';
import {
  PageFooterAction,
  PageFooterService,
} from '../../../../shared/ui/page-footer/page-footer.service';
import { ExamService } from '../../services/exam.service';

@Component({
  selector: 'app-exam-registration',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './exam-registration.html',
  styleUrl: './exam-registration.scss',
})
export class ExamRegistrationComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly examService = inject(ExamService);
  private readonly pageFooterService = inject(PageFooterService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly refreshTrigger = signal(0);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly selectedSession = signal<ExamSession | null>(null);
  protected readonly student = computed(() =>
    this.examService.getStudentByUserId(this.currentUser()?.id ?? 0),
  );
  protected readonly availableSessions = computed(() => {
    this.refreshTrigger();
    return this.examService.getAvailableSessions(this.student()?.id ?? 0);
  });
  protected readonly registrations = computed(() => {
    this.refreshTrigger();
    return this.examService.getRegistrations(this.student()?.id ?? 0)
      .sort(
        (left, right) =>
          new Date(right.registeredAt).getTime() - new Date(left.registeredAt).getTime(),
      );
  });

  ngOnInit(): void {
    this.updateFooterActions();
  }

  ngOnDestroy(): void {
    this.pageFooterService.clear();
  }

  protected courseName(courseId: number): string {
    const course = FACULTY_MOCK_DATA.courses.find((item) => item.id === courseId);
    return course ? `${course.code} - ${course.name}` : 'Unknown course';
  }

  protected selectSession(session: ExamSession): void {
    this.selectedSession.set(session);
    this.updateFooterActions();
  }

  protected registrationSession(registration: ExamRegistration): ExamSession | undefined {
    return FACULTY_MOCK_DATA.examSessions.find((session) => session.id === registration.examSessionId);
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  protected seatsRemaining(session: ExamSession): number {
    return session.capacity - session.registeredCount;
  }

  protected register(): void {
    const session = this.selectedSession();
    const student = this.student();
    if (!session || !student) {
      return;
    }

    this.examService.register(student.id, session.id).subscribe((registration) => {
      if (!registration) {
        this.snackBar.open('This exam is no longer available for registration.', 'Close', {
          duration: 3000,
        });
        this.refreshTrigger.update((value) => value + 1);
        this.selectedSession.set(null);
        this.updateFooterActions();
        return;
      }

      this.snackBar.open('Exam registration completed successfully.', 'Close', {
        duration: 2500,
      });
      this.refreshTrigger.update((value) => value + 1);
      this.selectedSession.set(null);
      this.updateFooterActions();
    });
  }

  protected cancelRegistration(registration: ExamRegistration): void {
    this.examService.cancel(registration).subscribe((updated) => {
      if (!updated) {
        return;
      }

      this.snackBar.open('Exam registration cancelled.', 'Close', { duration: 2500 });
      this.refreshTrigger.update((value) => value + 1);
    });
  }

  private updateFooterActions(): void {
    const actions: PageFooterAction[] = [
      {
        label: 'Register for exam',
        icon: 'event_available',
        variant: 'flat',
        color: 'primary',
        disabled: !this.selectedSession() || !this.student(),
        onClick: () => this.register(),
      },
    ];
    this.pageFooterService.setActions(actions);
  }
}
