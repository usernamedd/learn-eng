import { NavLink, Outlet } from 'react-router-dom';
import { SUPPORTED_LANGUAGES } from '../domain/configuration/entities';
import { useAppServices } from '../AppContext';
import { useCallback } from 'react';

export default function Layout() {
  const { configService } = useAppServices();
  const currentLang = configService.getTargetLanguage();
  const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);

  const navLinkClass = useCallback(
    ({ isActive }: { isActive: boolean }) =>
      `nav-link${isActive ? ' active' : ''}`,
    []
  );

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-title">
          <h1>📖 Learn English</h1>
        </div>
        <div className="app-language">
          {langInfo ? `${langInfo.flag} ${langInfo.name}` : currentLang}
        </div>
      </header>

      <nav className="app-nav">
        <NavLink to="/translate" className={navLinkClass}>
          🔤 翻译
        </NavLink>
        <NavLink to="/chat" className={navLinkClass}>
          💬 对话
        </NavLink>
        <NavLink to="/settings" className={navLinkClass}>
          ⚙️ 设置
        </NavLink>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
