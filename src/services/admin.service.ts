import type { Payment, PaymentMethodKey, PaymentMethodSetting, Restaurant, RestaurantStatus, Theme, ThemePackage, User, UserRole } from '@prisma/client';
import { AdminRestaurantRepository } from '@/repositories/admin/admin-restaurant.repository';
import { AdminUserRepository } from '@/repositories/admin/admin-user.repository';
import { AdminPaymentRepository } from '@/repositories/admin/admin-payment.repository';
import { AdminThemeRepository } from '@/repositories/admin/admin-theme.repository';
import { PaymentRepository } from '@/repositories/payment.repository';
import { PaymentMethodRepository } from '@/repositories/payment-method.repository';
import { AuditLogService } from './audit-log.service';
import { PaymentService } from './payment.service';
import { ManualPaymentService } from './manual-payment.service';
import { toPackageCreateData, toPackageUpdateData, toThemeCreateData, toThemeUpdateData } from './admin-catalog.mappers';
import { ForbiddenError, NotFoundError } from '@/lib/errors/errors';
import type { AdminContext } from '@/lib/admin/require-admin';
import type {
  CreatePackageDTO,
  CreateThemeDTO,
  UpdatePackageDTO,
  UpdateThemeDTO,
} from '@/dtos/admin.dto';

/**
 * High-level admin operations. Every mutation:
 *  - performs the repo write,
 *  - records an entry via AuditLogService.
 *
 * Callers must already have an `AdminContext` from `requireAdmin()`.
 */
export class AdminService {
  constructor(
    private readonly restaurants = new AdminRestaurantRepository(),
    private readonly users = new AdminUserRepository(),
    private readonly payments = new AdminPaymentRepository(),
    private readonly themes = new AdminThemeRepository(),
    private readonly audit = new AuditLogService(),
    private readonly paymentService = new PaymentService(),
    private readonly paymentRepo = new PaymentRepository(),
    private readonly paymentMethods = new PaymentMethodRepository(),
    private readonly manualPayments = new ManualPaymentService(),
  ) {}

  public async setRestaurantStatus(
    actor: AdminContext,
    restaurantId: string,
    status: RestaurantStatus,
  ): Promise<Restaurant> {
    const before = await this.restaurants.findById(restaurantId);
    if (!before) throw new NotFoundError('Restaurant');
    const updated = await this.restaurants.setStatus(restaurantId, status);
    await this.audit.record(
      actor,
      status === 'SUSPENDED' ? 'restaurant.suspend' : status === 'ACTIVE' ? 'restaurant.activate' : 'restaurant.set_status',
      { type: 'restaurant', id: restaurantId },
      { newStatus: status, previousStatus: before?.status ?? null },
    );
    return updated;
  }

  public async deleteRestaurant(actor: AdminContext, restaurantId: string): Promise<Restaurant> {
    const restaurant = await this.restaurants.findById(restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant');
    const deleted = await this.restaurants.delete(restaurantId);
    await this.audit.record(
      actor,
      'restaurant.delete',
      { type: 'restaurant', id: restaurantId },
      {
        name: restaurant.name,
        slug: restaurant.slug,
        ownerId: restaurant.ownerId,
        status: restaurant.status,
        planKey: restaurant.planKey,
      },
    );
    return deleted;
  }

  public async setUserRole(actor: AdminContext, userId: string, role: UserRole): Promise<User> {
    if (userId === actor.userId && role !== 'ADMIN') {
      throw new ForbiddenError('You cannot demote yourself');
    }
    const target = await this.users.findById(userId);
    if (!target) throw new NotFoundError('User');
    const updated = await this.users.setRole(userId, role);
    await this.audit.record(
      actor,
      'user.set_role',
      { type: 'user', id: userId },
      { newRole: role, previousRole: target.role, email: target.email },
    );
    return updated;
  }

  /**
   * Refund via the real Paymob API; only marks the DB row REFUNDED on Paymob success.
   * Downgrades the restaurant theme to Classic if this payment activated the current one.
   */
  public async refundPayment(actor: AdminContext, paymentId: string): Promise<Payment> {
    const { refundTransactionId } = await this.paymentService.refund(paymentId);
    const refreshed = await this.paymentRepo.findById(paymentId);
    if (!refreshed) throw new NotFoundError('Payment');
    await this.audit.record(
      actor,
      'payment.refund',
      { type: 'payment', id: paymentId },
      {
        amountCents: refreshed.amountCents,
        currencyCode: refreshed.currencyCode,
        paymobRefundTransactionId: refundTransactionId,
      },
    );
    return refreshed;
  }

  public async confirmManualPayment(actor: AdminContext, paymentId: string): Promise<Payment> {
    const refreshed = await this.manualPayments.confirmManualPayment(paymentId);
    await this.audit.record(
      actor,
      'payment.manual_confirm',
      { type: 'payment', id: paymentId },
      {
        amountCents: refreshed.amountCents,
        currencyCode: refreshed.currencyCode,
        planKey: refreshed.planKey,
        themeId: refreshed.themeId,
      },
    );
    return refreshed;
  }

  /** Enable/disable a platform-wide checkout payment method (Card / Apple Pay / InstaPay). */
  public async setPaymentMethodActive(
    actor: AdminContext,
    method: PaymentMethodKey,
    isActive: boolean,
  ): Promise<PaymentMethodSetting> {
    const updated = await this.paymentMethods.setActive(method, isActive);
    await this.audit.record(
      actor,
      isActive ? 'payment_method.enable' : 'payment_method.disable',
      { type: 'payment_method', id: method },
      { method, isActive },
    );
    return updated;
  }

  public async createTheme(actor: AdminContext, input: CreateThemeDTO): Promise<Theme> {
    const created = await this.themes.create(toThemeCreateData(input));
    await this.audit.record(actor, 'theme.create', { type: 'theme', id: created.id }, { key: created.key });
    return created;
  }

  public async updateTheme(actor: AdminContext, input: UpdateThemeDTO): Promise<Theme> {
    const updated = await this.themes.update(input.id, toThemeUpdateData(input));
    await this.audit.record(actor, 'theme.update', { type: 'theme', id: input.id });
    return updated;
  }

  public async deleteTheme(actor: AdminContext, id: string): Promise<Theme> {
    const deleted = await this.themes.delete(id);
    await this.audit.record(actor, 'theme.delete', { type: 'theme', id });
    return deleted;
  }

  public async createPackage(actor: AdminContext, input: CreatePackageDTO): Promise<ThemePackage> {
    const created = await this.themes.createPackage(toPackageCreateData(input));
    await this.audit.record(actor, 'package.create', { type: 'package', id: created.id });
    return created;
  }

  public async updatePackage(actor: AdminContext, input: UpdatePackageDTO): Promise<ThemePackage> {
    const updated = await this.themes.updatePackage(input.id, toPackageUpdateData(input));
    await this.audit.record(actor, 'package.update', { type: 'package', id: input.id });
    return updated;
  }

  public async deletePackage(actor: AdminContext, id: string): Promise<ThemePackage> {
    const deleted = await this.themes.deletePackage(id);
    await this.audit.record(actor, 'package.delete', { type: 'package', id });
    return deleted;
  }

  public async assignPlan(actor: AdminContext, restaurantId: string, planKey: string): Promise<Restaurant> {
    const updated = await this.restaurants.setPlan(restaurantId, planKey);
    await this.audit.record(
      actor,
      'restaurant.assign_plan',
      { type: 'restaurant', id: restaurantId },
      { planKey },
    );
    return updated;
  }
}
