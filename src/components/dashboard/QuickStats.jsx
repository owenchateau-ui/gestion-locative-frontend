import { memo } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { CreditCard, CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import { STAT_ICON_STYLES } from '../../constants/designSystem'

/**
 * QuickStats - Stats rapides et paiements récents Bold Geometric
 * Affiche des stats clés et la liste des derniers paiements
 */

const PAYMENT_STATUS = {
  paid: {
    icon: CheckCircle,
    color: 'text-[#10B981]',
    bgColor: 'bg-[#10B981]/[0.12]',
    label: 'Payé'
  },
  pending: {
    icon: Clock,
    color: 'text-[#F59E0B]',
    bgColor: 'bg-[#F59E0B]/[0.12]',
    label: 'En attente'
  },
  late: {
    icon: AlertCircle,
    color: 'text-[#FF6B4A]',
    bgColor: 'bg-[#FF6B4A]/[0.12]',
    label: 'En retard'
  }
}

const PaymentItem = memo(function PaymentItem({ payment }) {
  const status = PAYMENT_STATUS[payment.status] || PAYMENT_STATUS.pending
  const StatusIcon = status.icon

  return (
    <Link
      to={`/payments/${payment.id}`}
      className="group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-[var(--surface-hover)]"
    >
      {/* Status icon */}
      <div className={`
        w-9 h-9 rounded-lg flex items-center justify-center
        ${status.bgColor}
      `}>
        <StatusIcon className={`w-4 h-4 ${status.color}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text)] truncate">
          {payment.tenantName}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {payment.propertyName} · {new Date(payment.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </p>
      </div>

      {/* Montant */}
      <div className="text-right">
        <p className="text-sm font-bold font-display text-[var(--text)]">
          {payment.amount.toLocaleString('fr-FR')} €
        </p>
        <p className={`text-xs ${status.color}`}>
          {status.label}
        </p>
      </div>
    </Link>
  )
})

const StatItem = memo(function StatItem({ label, value, color = 'text-[var(--text)]', suffix }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <span className={`text-lg font-bold font-display ${color}`}>
        {value}{suffix}
      </span>
    </div>
  )
})

const QuickStats = memo(function QuickStats({
  stats = {},
  recentPayments = [],
  title = "Aperçu financier",
  maxPayments = 4,
  className = ''
}) {
  const {
    totalRevenue = 0,
    paidThisMonth = 0,
    pendingAmount = 0,
    lateAmount = 0
  } = stats

  return (
    <div className={`
      group/card relative overflow-hidden
      bg-[var(--surface)] border border-[var(--border)]
      rounded-2xl p-6
      transition-all duration-200
      hover:border-[#C6F135] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]
      ${className}
    `}>
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-[#C6F135] to-[#D4F85A]" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium font-display text-[var(--text-secondary)]">{title}</h3>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${STAT_ICON_STYLES.lime.container}`}>
          <CreditCard className={`w-5 h-5 ${STAT_ICON_STYLES.lime.icon}`} />
        </div>
      </div>

      {/* Stats rapides */}
      <div className="space-y-1 mb-6 pb-6 border-b border-[var(--border)]">
        <StatItem
          label="Revenus du mois"
          value={totalRevenue.toLocaleString('fr-FR')}
          suffix=" €"
          color="text-[var(--color-electric-blue)]"
        />
        <StatItem
          label="Encaissé"
          value={paidThisMonth.toLocaleString('fr-FR')}
          suffix=" €"
          color="text-emerald-600 dark:text-emerald-400"
        />
        <StatItem
          label="En attente"
          value={pendingAmount.toLocaleString('fr-FR')}
          suffix=" €"
          color="text-amber-600 dark:text-amber-400"
        />
        {lateAmount > 0 && (
          <StatItem
            label="Impayés"
            value={lateAmount.toLocaleString('fr-FR')}
            suffix=" €"
            color="text-[#FF6B4A]"
          />
        )}
      </div>

      {/* Paiements récents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-medium font-display text-[var(--text-muted)] uppercase tracking-wider">
            Derniers paiements
          </h4>
          <Link
            to="/payments"
            className="text-xs font-medium text-[var(--color-electric-blue)] hover:underline"
          >
            Voir tout
          </Link>
        </div>

        {recentPayments.length > 0 ? (
          <div className="space-y-1">
            {recentPayments.slice(0, maxPayments).map((payment) => (
              <PaymentItem key={payment.id} payment={payment} />
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">Aucun paiement récent</p>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <Link
          to="/payments/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium bg-[#C6F135] text-[#0A0A0F] hover:brightness-105 transition-all"
        >
          <CreditCard className="w-4 h-4" />
          Enregistrer un paiement
        </Link>
      </div>
    </div>
  )
})

QuickStats.propTypes = {
  stats: PropTypes.shape({
    totalRevenue: PropTypes.number,
    paidThisMonth: PropTypes.number,
    pendingAmount: PropTypes.number,
    lateAmount: PropTypes.number
  }),
  recentPayments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    propertyName: PropTypes.string,
    amount: PropTypes.number.isRequired,
    dueDate: PropTypes.string,
    status: PropTypes.oneOf(['paid', 'pending', 'late'])
  })),
  title: PropTypes.string,
  maxPayments: PropTypes.number,
  className: PropTypes.string
}

export default QuickStats
