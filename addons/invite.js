// TrustMe AI - Invite page logic
(function () {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function getInviteCode() {
    // Try URL first, then localStorage, then fallback
    const params = new URLSearchParams(location.search);
    const code = params.get('code') || localStorage.getItem('tmi_invite_code') || 'TMI8K';
    return code.toUpperCase();
  }

  function getBaseURL() {
    // Allow override via localStorage; otherwise default to current origin + /reg
    return localStorage.getItem('tmi_invite_base') || (location.origin + '/reg');
  }

  function buildLink(code) {
    const base = getBaseURL();
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}ref=${encodeURIComponent(code)}`;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  function copyText(value) {
    return navigator.clipboard.writeText(value);
  }

  function downloadCanvasPNG(canvas, filename='invite-qr.png') {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
  }

  function renderQR(text) {
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) return;
    if (window.QRCode) {
      // Using qrcode (davidshimjs) style lib -> new QRCode(element, options)
      try {
        // Clean container and render into a temp div, then draw on canvas
        const tmp = document.createElement('div');
        new window.QRCode(tmp, { text, width: 256, height: 256, correctLevel: window.QRCode.CorrectLevel.M });
        const img = tmp.querySelector('img') || tmp.querySelector('canvas');
        const c2d = canvas.getContext('2d');
        canvas.width = 260; canvas.height = 260;
        if (img && img.width) {
          c2d.drawImage(img, 2, 2, 256, 256);
        } else {
          // fallback: draw text
          c2d.fillStyle = '#9aa3af';
          c2d.font = '14px sans-serif';
          c2d.fillText('QR error: reload page', 30, 130);
        }
      } catch (e) {
        console.error('QR render error', e);
      }
    } else if (window.QRCodeStyling || window.QRCodeGenerator) {
      // not used here, but reserved for other libs
    } else if (window.QRCodeQ) {
      // reserved
    } else if (window.QRCodeLib && window.QRCodeLib.toCanvas) {
      window.QRCodeLib.toCanvas(canvas, text, { width: 256 });
    } else if (window.QRCode && window.QRCode.toCanvas) {
      // Some cdn libs expose QRCode.toCanvas
      window.QRCode.toCanvas(canvas, text, { width: 256 });
    } else {
      const ctx = canvas.getContext('2d');
      canvas.width = 300; canvas.height = 60;
      ctx.fillStyle = '#9aa3af';
      ctx.font = '12px sans-serif';
      ctx.fillText('QR library failed to load. Link below still works.', 10, 36);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const code = getInviteCode();
    const link = buildLink(code);

    setText('inviteCode', code);
    setText('inviteLink', link);
    renderQR(link);

    $('#copyLink').addEventListener('click', async () => {
      await copyText($('#inviteLink').value);
      $('#copyLink').textContent = 'Copied!';
      setTimeout(() => $('#copyLink').textContent = 'Copy', 900);
    });
    $('#copyCode').addEventListener('click', async () => {
      await copyText($('#inviteCode').value);
      $('#copyCode').textContent = 'Copied!';
      setTimeout(() => $('#copyCode').textContent = 'Copy', 900);
    });
    $('#downloadQR').addEventListener('click', () => downloadCanvasPNG($('#qrCanvas')));

    // Allow user to change code and auto-update link + QR
    $('#inviteCode').addEventListener('input', () => {
      const newCode = $('#inviteCode').value.trim().toUpperCase();
      const newLink = buildLink(newCode);
      $('#inviteLink').value = newLink;
      renderQR(newLink);
      localStorage.setItem('tmi_invite_code', newCode);
    });

    // Share API if supported
    const shareBtn = $('#shareLink');
    if (navigator.share) {
      shareBtn.style.display = 'inline-block';
      shareBtn.addEventListener('click', () => {
        navigator.share({ title: 'Join TrustMe AI', text: 'Register with my invite link', url: $('#inviteLink').value });
      });
    } else {
      shareBtn.style.display = 'none';
    }
  });
})();
