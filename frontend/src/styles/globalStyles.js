const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0d2137;
    --navy-mid: #1a3a5c;
    --navy-light: #1f4976;
    --sky: #4a9eca;
    --sky-light: #b8ddf0;
    --sky-pale: #ddeef8;
    --sky-bg: #e8f4fb;
    --white: #ffffff;
    --gray-100: #f4f7fa;
    --gray-200: #e2eaf2;
    --gray-400: #94abbe;
    --gray-600: #4a6580;
    --orange: #e07b2a;
    --green: #2e8b57;
    --red: #c0392b;
    --radius: 4px;
    --shadow: 0 2px 8px rgba(13,33,55,0.12);
    --shadow-lg: 0 4px 20px rgba(13,33,55,0.18);
  }

  body { font-family: 'Barlow', sans-serif; background: var(--gray-100); color: var(--navy); min-height: 100vh; }

  /* Layout */
  .app { display: flex; min-height: 100vh; }
  .sidebar {
    width: 220px; background: var(--navy); display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
    box-shadow: 2px 0 12px rgba(0,0,0,0.2);
  }
  .sidebar-logo {
    padding: 20px 16px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .sidebar-logo h1 {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px; font-weight: 700; color: var(--white);
    letter-spacing: 1px; line-height: 1;
  }
  .sidebar-logo span { font-size: 11px; color: var(--sky-light); letter-spacing: 2px; text-transform: uppercase; }
  .nav { flex: 1; padding: 12px 0; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 20px; cursor: pointer; transition: all 0.15s;
    color: var(--sky-light); font-size: 14px; font-weight: 500;
    border-left: 3px solid transparent;
    text-decoration: none;
  }
  .nav-item:hover { background: rgba(74,158,202,0.12); color: var(--white); }
  .nav-item.active { background: rgba(74,158,202,0.2); color: var(--white); border-left-color: var(--sky); }
  .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; min-width: 0; overflow-x: hidden; }
  .topbar {
    background: var(--white); padding: 14px 28px;
    border-bottom: 2px solid var(--sky-pale);
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
    box-shadow: 0 1px 4px rgba(13,33,55,0.08);
  }
  .topbar-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 24px; font-weight: 700; color: var(--navy);
    letter-spacing: 0.5px;
  }
  .topbar-sub { font-size: 12px; color: var(--gray-400); margin-top: 1px; }
  .content { padding: 28px; flex: 1; }

  /* Cards */
  .card {
    background: var(--white); border-radius: var(--radius);
    box-shadow: var(--shadow); overflow: hidden;
  }
  .card-header {
    background: var(--navy); color: var(--white);
    padding: 12px 20px; display: flex; align-items: center; justify-content: space-between;
    font-family: 'Barlow Condensed', sans-serif; font-size: 16px;
    font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
  }
  .card-body { padding: 20px; }
  .card-section-header {
    background: var(--navy-mid); color: var(--white);
    padding: 9px 16px; font-size: 13px; font-weight: 600;
    letter-spacing: 0.5px; text-transform: uppercase;
    display: flex; align-items: center; gap: 8px;
  }

  /* Section split (matin / aprÃ¨s-midi) */
  .period-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  /* Form elements */
  .form-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
  .form-group { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 140px; }
  .form-group label { font-size: 11px; font-weight: 600; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.5px; }
  .form-group input, .form-group select, .form-group textarea {
    border: 1.5px solid var(--gray-200); border-radius: var(--radius);
    padding: 8px 10px; font-size: 13px; font-family: 'Barlow', sans-serif;
    color: var(--navy); background: var(--white); transition: border-color 0.15s;
    outline: none;
  }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    border-color: var(--sky);
    box-shadow: 0 0 0 3px rgba(74,158,202,0.12);
  }
  .form-group textarea { resize: vertical; min-height: 60px; }
  .form-group select { cursor: pointer; }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--radius);
    font-size: 13px; font-weight: 600; cursor: pointer;
    border: none; transition: all 0.15s; white-space: nowrap;
    font-family: 'Barlow', sans-serif;
  }
  .btn-primary { background: var(--navy); color: var(--white); }
  .btn-primary:hover { background: var(--navy-light); }
  .btn-sky { background: var(--sky); color: var(--white); }
  .btn-sky:hover { background: var(--navy-mid); }
  .btn-success { background: var(--green); color: var(--white); }
  .btn-success:hover { background: #236b44; }
  .btn-danger { background: var(--red); color: var(--white); }
  .btn-danger:hover { background: #922b21; }
  .btn-info { background: #20b2aa; color: var(--white); }
  .btn-info:hover { background: #178f88; }
  .btn-ghost { background: transparent; color: var(--navy); border: 1.5px solid var(--gray-200); }
  .btn-ghost:hover { border-color: var(--sky); color: var(--sky); }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Toast */
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: var(--navy); color: var(--white);
    padding: 12px 20px; border-radius: var(--radius);
    box-shadow: var(--shadow-lg); font-size: 13px; font-weight: 500;
    display: flex; align-items: center; gap: 8px;
    animation: slideUp 0.25s ease;
    border-left: 4px solid var(--sky);
  }
  .toast.error { border-left-color: var(--red); }
  .toast.success { border-left-color: var(--green); }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* Table */
  .table-wrap { overflow-x: auto; }

  /* Salary table scroll helpers */
  .table-top-scroll {
    overflow-x: scroll; overflow-y: hidden;
    height: 12px; background: var(--gray-200);
    border-bottom: 1px solid var(--sky-light);
    cursor: ew-resize;
  }
  .table-top-scroll::-webkit-scrollbar        { height: 12px; }
  .table-top-scroll::-webkit-scrollbar-track  { background: var(--gray-200); }
  .table-top-scroll::-webkit-scrollbar-thumb  { background: var(--sky); border-radius: 0; }

  .table-h-scroll { overflow-x: scroll; overflow-y: hidden; width: 100%; }
  .table-h-scroll::-webkit-scrollbar        { height: 6px; }
  .table-h-scroll::-webkit-scrollbar-track  { background: var(--gray-100); }
  .table-h-scroll::-webkit-scrollbar-thumb  { background: var(--sky-light); border-radius: 3px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th {
    background: var(--sky-bg); color: var(--navy-mid);
    padding: 10px 14px; text-align: left; font-weight: 700;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;
    border-bottom: 2px solid var(--sky-light);
    white-space: nowrap;
  }
  td { padding: 10px 14px; border-bottom: 1px solid var(--gray-200); vertical-align: middle; }
  tbody tr:nth-child(even) td { background: var(--gray-100); }
  tbody tr:hover td { background: var(--sky-pale) !important; transition: background 0.12s; }
  tbody tr.row-hl td { background: var(--sky-pale) !important; transition: background 0.12s; }
  .badge {
    display: inline-block; padding: 2px 8px; border-radius: 20px;
    font-size: 11px; font-weight: 600; text-transform: uppercase;
  }
  .badge-chantier { background: #fef3e2; color: #b25a00; }
  .badge-atelier { background: #e8f4fb; color: #1a5276; }
  .badge-bureau { background: #eafaf1; color: #1e8449; }

  /* Tag/chip */
  .chip {
    display: inline-block; background: var(--sky-pale); color: var(--navy-mid);
    padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;
  }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(13,33,55,0.55);
    display: flex; align-items: center; justify-content: center; z-index: 500;
  }
  .modal {
    background: var(--white); border-radius: var(--radius);
    width: 440px; max-width: 95vw; max-height: 90vh; box-shadow: var(--shadow-lg);
    overflow: hidden; display: flex; flex-direction: column;
  }
  .modal-header {
    background: var(--navy); color: var(--white); padding: 14px 20px;
    font-family: 'Barlow Condensed', sans-serif; font-size: 18px;
    font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; flex: 1; }
  .modal-footer { padding: 14px 20px; background: var(--gray-100); display: flex; justify-content: flex-end; gap: 8px; }

  /* Pointage section */
  .pointage-period { border: 1.5px solid var(--sky-light); border-radius: var(--radius); overflow: hidden; }
  .period-times { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 14px; background: var(--sky-bg); }
  .period-details { padding: 14px; display: flex; flex-direction: column; gap: 12px; }

  /* Divider */
  .divider { height: 1px; background: var(--gray-200); margin: 16px 0; }

  /* Page header */
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .page-header h2 { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 700; color: var(--navy); }

  /* Date strip */
  .date-strip {
    background: var(--navy-mid); color: var(--white); padding: 10px 20px;
    display: flex; align-items: center; gap: 16px;
    font-size: 13px;
  }
  .date-strip input[type=date] {
    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
    color: var(--white); padding: 5px 10px; border-radius: var(--radius);
    font-family: 'Barlow', sans-serif; font-size: 13px; cursor: pointer;
  }
  .date-strip input[type=date]:focus { outline: none; border-color: var(--sky); }

  /* Summary row */
  .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .summary-card {
    background: var(--white); border-radius: var(--radius); padding: 16px;
    box-shadow: var(--shadow); border-top: 3px solid var(--sky);
  }
  .summary-card .value { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 700; color: var(--navy); }
  .summary-card .label { font-size: 11px; color: var(--gray-400); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }

  .gap-12 { gap: 12px; }
  .mt-12 { margin-top: 12px; }
  .mt-16 { margin-top: 16px; }
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-8 { gap: 8px; }
  .text-sm { font-size: 12px; }
  .text-muted { color: var(--gray-400); }
  .w-full { width: 100%; }
`;

export default CSS;