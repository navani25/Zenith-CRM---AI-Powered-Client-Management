import React from 'react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: string;
  label: Page;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-2.5 my-1 rounded-lg transition-colors text-sm font-medium ${
        isActive
          ? 'bg-primary text-primary-foreground shadow'
          : 'text-muted-foreground dark:text-dark-muted-foreground hover:bg-secondary dark:hover:bg-dark-secondary hover:text-foreground dark:hover:text-dark-foreground'
      }`}
    >
      <i data-lucide={icon} className="w-5 h-5 mr-3"></i>
      <span className="flex-1">{label}</span>
    </a>
  </li>
);

const NavGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="mt-6">
    <h3 className="px-2.5 text-xs font-semibold text-muted-foreground dark:text-dark-muted-foreground uppercase tracking-wider mb-2">{title}</h3>
    <ul>{children}</ul>
  </div>
);

const UpgradeCard: React.FC = () => (
    <div className="p-4 mt-8 rounded-xl bg-secondary dark:bg-dark-secondary text-center">
        <div className="p-3 inline-block bg-white/80 dark:bg-dark-card/50 backdrop-blur-sm rounded-full shadow-sm">
            <i data-lucide="rocket" className="w-7 h-7 text-primary"></i>
        </div>
    </div>
);


export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
  const mainNav: Page[] = ['Dashboard', 'Analytics', 'Deals', 'Tasks', 'Calendar'];
  const workspaceNav: Page[] = ['Contacts', 'Leads', 'Emails', 'Proposals'];
  const toolsNav: Page[] = ['AI Assistant'];
  const configNav: Page[] = ['Profile'];

  const navIcons: Record<Page, string> = {
    'Dashboard': 'layout-dashboard',
    'Analytics': 'bar-chart-3',
    'Deals': 'kanban-square',
    'Tasks': 'check-circle',
    'Calendar': 'calendar',
    'Contacts': 'users',
    'Leads': 'target',
    'Emails': 'mail',
    'Proposals': 'file-text',
    'AI Assistant': 'sparkles',
    'Settings': 'sliders-horizontal',
    'Profile': 'user-circle',
  };

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <aside className={`fixed z-20 inset-y-0 left-0 w-64 bg-card dark:bg-dark-card p-4 border-r border-border dark:border-dark-border flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center mb-8 px-1">
          <div className="p-2 bg-primary/10 rounded-lg">
             <i data-lucide="leaf" className="w-6 h-6 text-primary"></i>
          </div>
          <h1 className="text-xl font-bold text-foreground dark:text-dark-foreground ml-2">Zenith CRM<span className="text-primary">.</span></h1>
        </div>
        <nav className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          <NavGroup title="General">
            {mainNav.map((page) => (
              <NavItem
                key={page}
                icon={navIcons[page]}
                label={page}
                isActive={currentPage === page}
                onClick={() => handleNavClick(page)}
              />
            ))}
          </NavGroup>
          <NavGroup title="Workspace">
            {workspaceNav.map((page) => (
              <NavItem
                key={page}
                icon={navIcons[page]}
                label={page}
                isActive={currentPage === page}
                onClick={() => handleNavClick(page)}
              />
            ))}
          </NavGroup>
           <NavGroup title="Tools">
            {toolsNav.map((page) => (
              <NavItem
                key={page}
                icon={navIcons[page]}
                label={page}
                isActive={currentPage === page}
                onClick={() => handleNavClick(page)}
              />
            ))}
          </NavGroup>
           <NavGroup title="Configuration">
            {configNav.map((page) => (
              <NavItem
                key={page}
                icon={navIcons[page]}
                label={page}
                isActive={currentPage === page}
                onClick={() => handleNavClick(page)}
              />
            ))}
          </NavGroup>
        </nav>
         <div className="mt-auto">
            <UpgradeCard />
         </div>
      </aside>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-10 md:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};