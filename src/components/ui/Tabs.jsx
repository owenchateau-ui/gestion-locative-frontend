import { useState } from 'react'

function Tabs({ tabs, defaultTab, onChange }) {
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0].id : null))

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    if (onChange) {
      onChange(tabId)
    }
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  return (
    <div>
      {/* Tab Headers */}
      <div className="border-b border-[var(--border)]">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disabled={tab.disabled}
                className={`
                  relative px-1 py-4 text-sm font-medium font-display transition-colors
                  ${isActive
                    ? 'text-[var(--color-electric-blue)] border-b-2 border-[var(--color-electric-blue)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] border-b-2 border-transparent'
                  }
                  ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center gap-2">
                  {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`
                      ml-2 px-2 py-0.5 text-xs font-semibold rounded-full
                      ${isActive
                        ? 'bg-[var(--color-electric-blue)]/10 text-[var(--color-electric-blue)]'
                        : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                      }
                    `}>
                      {tab.badge}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTabData?.content}
      </div>
    </div>
  )
}

export default Tabs
