import { useState, useEffect, useCallback } from "react";

const ROLES = ["All", "admin", "moderator", "user"];

const roleColor = {
  admin: { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  moderator: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  user: { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
};

const genderIcon = (g) => (g === "female" ? "♀" : "♂");

const Avatar = ({ user }) => (
  <div style={{
    width: 38, height: 38, borderRadius: "50%",
    overflow: "hidden", flexShrink: 0,
    border: "2px solid #E5E7EB", background: "#F3F4F6",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <img src={user.image} alt={user.firstName}
      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);

const RoleBadge = ({ role }) => {
  const c = roleColor[role] || roleColor.user;
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: "2px 8px", borderRadius: 999,
      fontSize: 10, fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%",
        background: c.dot, display: "inline-block" }} />
      {role}
    </span>
  );
};const StatCard = ({ label, value, color }) => (
  <div style={{
    background: "#fff", borderRadius: 12,
    padding: "16px 18px", flex: 1, minWidth: 100,
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    borderTop: `3px solid ${color}`,
  }}>
    <div style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>{value}</div>
    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{label}</div>
  </div>
);

const Modal = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.45)", zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, padding: 28,
        maxWidth: 380, width: "90%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center",
          gap: 14, marginBottom: 18 }}>
          <Avatar user={user} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16,
              color: "#111827" }}>{user.firstName} {user.lastName}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>@{user.username}</div>
          </div>
          <div style={{ marginLeft: "auto" }}><RoleBadge role={user.role} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            ["📧", "Email", user.email],
            ["📱", "Phone", user.phone],
            ["🎂", "Age", `${user.age} yrs`],
            ["⚧", "Gender", user.gender],
            ["🏢", "Company", user.company?.name],
            ["📍", "City", `${user.address?.city}, ${user.address?.country}`],
          ].map(([icon, label, val]) => (
            <div key={label} style={{ background: "#F9FAFB",
              borderRadius: 8, padding: "9px 12px" }}>
              <div style={{ fontSize: 10, color: "#9CA3AF" }}>{icon} {label}</div>
              <div style={{ fontSize: 12, fontWeight: 600,
                color: "#111827", marginTop: 2 }}>{val || "—"}</div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: 18, width: "100%",
          padding: 10, background: "#6366F1", color: "#fff",
          border: "none", borderRadius: 10, cursor: "pointer",
          fontSize: 13, fontWeight: 700 }}>Close ✕</button>
      </div>
    </div>
  );
};const td = { padding: "12px 12px", borderBottom: "1px solid #F3F4F6",
  fontSize: 12, verticalAlign: "middle" };
const thStyle = { padding: "10px 12px", textAlign: "left",
  fontSize: 10, fontWeight: 700, color: "#9CA3AF",
  letterSpacing: 0.8, textTransform: "uppercase",
  background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" };

export default function UsersDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [gender, setGender] = useState("All");
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const PER_PAGE = 8;

  useEffect(() => {
    fetch("https://dummyjson.com/users?limit=100")
      .then(r => r.json())
      .then(d => { setUsers(d.users); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSort = useCallback((key) => {
    setSortDir(d => sortKey === key ? (d === "asc" ? "desc" : "asc") : "asc");
    setSortKey(key);
    setPage(1);
  }, [sortKey]);

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      return (
        (u.firstName + " " + u.lastName + u.email + u.username)
          .toLowerCase().includes(q) &&
        (role === "All" || u.role === role) &&
        (gender === "All" || u.gender === gender)
      );
    })
    .sort((a, b) => {
      let va = sortKey === "name" ? a.firstName : a[sortKey];
      let vb = sortKey === "name" ? b.firstName : b[sortKey];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    mods: users.filter(u => u.role === "moderator").length,
    countries: [...new Set(users.map(u => u.address?.country))].length,
  };
  const inputStyle = { padding: "8px 12px", borderRadius: 9,
    border: "1.5px solid #E5E7EB", fontSize: 12,
    color: "#374151", background: "#fff", outline: "none" };if (loading) return (
    <div style={{ display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100vh", gap: 16, fontFamily: "system-ui" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 36, height: 36, border: "4px solid #E5E7EB",
        borderTopColor: "#6366F1", borderRadius: "50%",
        animation: "spin .8s linear infinite" }} />
      <span style={{ color: "#9CA3AF", fontSize: 13 }}>Loading users…</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6",
      fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`*{box-sizing:border-box}`}</style>
      <div style={{ background: "linear-gradient(135deg,#6366F1 0%,#4F46E5 100%)",
        padding: "20px 28px", display: "flex",
        alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800,
            color: "#fff" }}>👥 Users Dashboard</h1>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)",
            marginTop: 3 }}>dummyjson.com API</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", color: "#fff",
          borderRadius: 10, padding: "7px 16px", fontSize: 12,
          fontWeight: 700 }}>{users.length} Users</div>
      </div>
      <div style={{ padding: "20px 24px", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <StatCard label="Total" value={stats.total} color="#6366F1" />
          <StatCard label="Admins" value={stats.admins} color="#EF4444" />
          <StatCard label="Moderators" value={stats.mods} color="#F59E0B" />
          <StatCard label="Countries" value={stats.countries} color="#10B981" />
          <StatCard label="Filtered" value={filtered.length} color="#3B82F6" />
        </div>
        <div style={{ background: "#fff", borderRadius: 12, padding: "14px 18px",
          display: "flex", gap: 10, flexWrap: "wrap",
          alignItems: "center", marginBottom: 14 }}>
          <input style={{ ...inputStyle, flex: 1, minWidth: 180 }}
            placeholder="🔍 Search..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select style={inputStyle} value={role}
            onChange={e => { setRole(e.target.value); setPage(1); }}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <select style={inputStyle} value={gender}
            onChange={e => { setGender(e.target.value); setPage(1); }}>
            {["All","male","female"].map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                {[["name","User"],["email","Email"],["role","Role"],
                  ["age","Age"]].map(([k,l]) => (
                  <th key={k} style={{ ...thStyle, cursor: "pointer" }}
                    onClick={() => handleSort(k)}>{l}
                    {sortKey===k?(sortDir==="asc"?"↑":"↓"):"↕"}</th>
                ))}
                <th style={thStyle}>Country</th>
              </tr></thead>
              <tbody>
                {paginated.map(u => (
                  <tr key={u.id} onClick={() => setSelected(u)}
                    style={{ cursor: "pointer" }}>
                    <td style={td}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <Avatar user={u} />
                        <div>
                          <div style={{ fontWeight:600, fontSize:13 }}>
                            {u.firstName} {u.lastName}</div>
                          <div style={{ fontSize:11, color:"#9CA3AF" }}>
                            @{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={td}>{u.email}</td>
                    <td style={td}><RoleBadge role={u.role} /></td>
                    <td style={td}>{u.age}</td>
                    <td style={td}>{u.address?.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between",
            padding:"12px 18px", borderTop:"1px solid #F3F4F6" }}>
            <span style={{ fontSize:12, color:"#9CA3AF" }}>
              {filtered.length} users</span>
            <div style={{ display:"flex", gap:5 }}>
              <button disabled={page===1} onClick={() => setPage(p=>p-1)}
                style={{ padding:"6px 12px", borderRadius:7,
                  border:"1.5px solid #E5E7EB", background:"#fff",
                  cursor:page===1?"not-allowed":"pointer",
                  opacity:page===1?0.4:1, fontSize:12 }}>← Prev</button>
              <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
                style={{ padding:"6px 12px", borderRadius:7,
                  border:"1.5px solid #E5E7EB", background:"#fff",
                  cursor:page===totalPages?"not-allowed":"pointer",
                  opacity:page===totalPages?0.4:1, fontSize:12 }}>Next →</button>
            </div>
          </div>
        </div>
      </div>
      <Modal user={selected} onClose={() => setSelected(null)} />
    </div>
  );
}