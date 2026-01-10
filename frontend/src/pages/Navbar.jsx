import "./Navbar.css";

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <MenuItem title="Dashboards" icon="🏠">
          <DropdownItem text="Tổng quan" />
          <DropdownItem text="Thống kê" />
        </MenuItem>

        <MenuItem title="Dịch vụ Facebook" icon="📘">
          <DropdownItem text="Tăng like" />
          <DropdownItem text="Tăng follow" />
          <DropdownItem text="Tăng comment" />
        </MenuItem>

        <MenuItem title="Dịch vụ Instagram" icon="📸">
          <DropdownItem text="Tăng like" />
          <DropdownItem text="Tăng follow" />
        </MenuItem>

        <MenuItem title="Dịch vụ TikTok" icon="🎵">
          <DropdownItem text="Tăng tim" />
          <DropdownItem text="Tăng view" />
        </MenuItem>

        <MenuItem title="Kiếm xu" icon="💰">
          <DropdownItem text="Làm nhiệm vụ" />
          <DropdownItem text="Lịch sử xu" />
        </MenuItem>
      </div>

      <div className="navbar-right">
        <MenuItem title="Tài khoản" icon="👤">
          <DropdownItem text="Thông tin cá nhân" />
          <DropdownItem text="Đổi mật khẩu" />
          <DropdownItem text="Đăng xuất" />
        </MenuItem>
      </div>
    </div>
  );
}

function MenuItem({ title, icon, children }) {
  return (
    <div className="menu-item">
      <span className="menu-title">
        <span className="icon">{icon}</span>
        {title}
        <span className="arrow">▾</span>
      </span>
      <div className="dropdown">{children}</div>
    </div>
  );
}

function DropdownItem({ text }) {
  return <div className="dropdown-item">{text}</div>;
}
