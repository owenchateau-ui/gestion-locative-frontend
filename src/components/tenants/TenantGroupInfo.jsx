import { Users, Heart, User } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { GROUP_TYPES, COUPLE_STATUS } from '../../constants/tenantConstants'
import { STAT_ICON_STYLES } from '../../constants/designSystem'

function TenantGroupInfo({ group, tenants = [] }) {
  if (!group) return null

  const groupType = GROUP_TYPES[group.group_type]
  const coupleStatus = group.couple_status ? COUPLE_STATUS[group.couple_status] : null
  const mainTenant = tenants.find(t => t.is_main_tenant) || tenants[0]
  const coTenant = tenants.find(t => !t.is_main_tenant)

  return (
    <Card title="Informations du groupe" padding>
      <div className="space-y-4">
        {/* Type de groupe */}
        <div className="flex items-center gap-3">
          {group.group_type === 'couple' ? (
            <Heart className={`w-5 h-5 ${STAT_ICON_STYLES.purple.icon}`} />
          ) : (
            <User className="w-5 h-5 text-[var(--text-muted)]" />
          )}
          <div>
            <p className="text-sm text-gray-500">Type de groupe</p>
            <p className="font-medium text-gray-900">{groupType?.label || group.group_type}</p>
          </div>
        </div>

        {/* Statut du couple */}
        {group.group_type === 'couple' && coupleStatus && (
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <Badge variant="info">{coupleStatus.label}</Badge>
            </div>
          </div>
        )}

        {/* Locataires */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Locataire{tenants.length > 1 ? 's' : ''}
          </p>

          <div className="space-y-3">
            {/* Locataire principal */}
            {mainTenant && (
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${STAT_ICON_STYLES.blue.container}`}>
                  <User className={`w-5 h-5 ${STAT_ICON_STYLES.blue.icon}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {mainTenant.first_name} {mainTenant.last_name}
                    </p>
                    <Badge variant="default" className="text-xs">Principal</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{mainTenant.email}</p>
                  {mainTenant.phone && (
                    <p className="text-sm text-gray-500">{mainTenant.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Co-locataire */}
            {coTenant && (
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${STAT_ICON_STYLES.purple.container}`}>
                  <User className={`w-5 h-5 ${STAT_ICON_STYLES.purple.icon}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {coTenant.first_name} {coTenant.last_name}
                    </p>
                    <Badge variant="default" className="text-xs">Co-titulaire</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{coTenant.email}</p>
                  {coTenant.phone && (
                    <p className="text-sm text-gray-500">{coTenant.phone}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nom du groupe */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">Nom du groupe</p>
          <p className="font-medium text-gray-900">{group.name}</p>
        </div>
      </div>
    </Card>
  )
}

export default TenantGroupInfo
