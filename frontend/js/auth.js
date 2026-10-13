function requireAuth(roles = null) {
  const user = getUser();
  const token = getToken();
  if (!token || !user) {
    window.location.href = '/login.html';
    return null;
  }
  if (roles && !roles.includes(user.role)) {
    alert('Bạn không có quyền truy cập trang này.');
    redirectByRole(user.role);
    return null;
  }
  return user;
}

function redirectByRole(role) {
  if (role === 'admin') window.location.href = '/pages/admin-dashboard.html';
  else if (role === 'recruiter') window.location.href = '/pages/recruiter-dashboard.html';
  else window.location.href = '/pages/seeker-dashboard.html';
}

function logout() {
  clearAuth();
  window.location.href = '/login.html';
}

function formatSalary(min, max) {
  if (!min && !max) return 'Thỏa thuận';
  const f = (n) => n ? (n / 1000000).toFixed(0) + ' triệu' : '';
  if (min && max) return f(min) + ' - ' + f(max);
  if (min) return 'Từ ' + f(min);
  return 'Đến ' + f(max);
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('vi-VN');
}

function statusBadge(status) {
  return `<span class="badge status-${status}">${status}</span>`;
}

function showAlert(elId, message, type = 'danger') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>`;
}
