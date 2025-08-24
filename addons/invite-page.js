
// Invite page logic for TrustMe AI
(function(){
  const codeInput = document.getElementById('inviteCode');
  const linkInput = document.getElementById('inviteLink');
  const copyLinkBtn = document.getElementById('copyLink');
  const shareBtn = document.getElementById('shareBtn');
  const copyCodeBtn = document.getElementById('copyCode');
  const qrBox = document.getElementById('qrBox');
  const downloadQRBtn = document.getElementById('downloadQR');
  const tipLabel = document.getElementById('tip');
  const backBtn = document.getElementById('backBtn');

  const loadCode = () => localStorage.getItem('tm_invite_code') || 'TMI8K';
  const saveCode = (v) => localStorage.setItem('tm_invite_code', v);

  function baseInviteUrl() {
    const origin = location.origin;
    return origin + '/reg?ref=';
  }

  function setInviteLink(code) {
    linkInput.value = baseInviteUrl() + encodeURIComponent(code);
  }

  // QR generator
  let lastQR = null;
  function renderQR(text){
    try {
      qrBox.innerHTML = ''; // clear
      const size = 240;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      qrBox.appendChild(canvas);
      const qr = new QRCode(4, QRCode.ErrorCorrectLevel.M);
      qr.addData(text);
      qr.make();
      qr.renderTo2dContext(ctx, Math.max(2, Math.floor(size / qr.getModuleCount())));
      // scale canvas to fixed size
      const tmp = document.createElement('canvas');
      const tctx = tmp.getContext('2d');
      tmp.width = size; tmp.height = size;
      tmp.getContext('2d').drawImage(canvas, 0, 0, size, size);
      qrBox.removeChild(canvas);
      qrBox.appendChild(tmp);
      lastQR = tmp;
      tipLabel.textContent = 'Scanning the QR opens your personal registration link.';
    } catch (err) {
      qrBox.textContent = 'QR error: ' + (err && err.message ? err.message : 'reload page');
    }
  }

  function updateAll() {
    const code = codeInput.value.trim() || 'TMI8K';
    saveCode(code);
    const link = baseInviteUrl() + encodeURIComponent(code);
    setInviteLink(code);
    renderQR(link);
  }

  // events
  codeInput.addEventListener('input', updateAll);
  copyLinkBtn.addEventListener('click', () => {
    linkInput.select();
    document.execCommand('copy');
    copyLinkBtn.textContent = 'Copied';
    setTimeout(()=>copyLinkBtn.textContent='Copy',1200);
  });
  copyCodeBtn.addEventListener('click', () => {
    codeInput.select();
    document.execCommand('copy');
    copyCodeBtn.textContent = 'Copied';
    setTimeout(()=>copyCodeBtn.textContent='Copy',1200);
  });
  shareBtn.addEventListener('click', async () => {
    const text = `Join me on TrustMe AI – use my invite code ${codeInput.value}.\n` + linkInput.value;
    if (navigator.share) {
      try { await navigator.share({ title: 'TrustMe AI Invite', text, url: linkInput.value }); } catch(_) {}
    } else {
      alert('Share is not supported on this device. Copy the link instead.');
    }
  });
  downloadQRBtn.addEventListener('click', () => {
    if (!lastQR) return;
    const a = document.createElement('a');
    a.href = lastQR.toDataURL('image/png');
    a.download = 'trustmeai-invite-qr.png';
    a.click();
  });
  backBtn.addEventListener('click', ()=> history.length ? history.back() : location.href = './index.html#team');

  // init
  codeInput.value = loadCode();
  updateAll();
})();
