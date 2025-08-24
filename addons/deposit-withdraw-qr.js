(function () {
  const ADDR = {
    USDT: {
      TRC20: 'TQ1vYnESLMbt967YY34FTqmvmE32kNbrN',
      BEP20: '0xYourBEP20AddressHere',
      ERC20: '0xYourERC20AddressHere'
    }
  };
  function renderQR(canvas, data) {
    if (!canvas) return;
    if (window.QRCode && typeof QRCode.toCanvas === 'function' && data) {
      QRCode.toCanvas(canvas, data, { width: 180 }, () => {});
      return;
    }
    try {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,canvas.width,canvas.height);
      if (!data) return;
      ctx.fillStyle = '#1f2937'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif';
      ctx.fillText('QR lib missing.', 10, 18);
      const parts = (data+'').match(/.{1,24}/g) || [data];
      parts.slice(0,5).forEach((ln, i) => ctx.fillText(ln, 10, 40 + i*16));
    } catch(e){}
  }
  function initTopup() {
    const ccySel = document.querySelector('#topupCurrency, [data-topup-currency]');
    const netSel = document.querySelector('#topupNetwork, [data-topup-network]');
    const addrEl = document.querySelector('#depositAddress, [data-deposit-address]');
    const qrCv   = document.querySelector('#depositQr, [data-deposit-qr]');
    const copyBtn= document.querySelector('[data-deposit-copy]');
    function update() {
      const ccy = (ccySel && ccySel.value) || 'USDT';
      const net = (netSel && netSel.value) || 'TRC20';
      const addr = ((ADDR[ccy]||{})[net]) || '';
      if (addrEl) { if ('value' in addrEl) addrEl.value = addr; else addrEl.textContent = addr; }
      renderQR(qrCv, addr);
    }
    if (copyBtn && addrEl) {
      copyBtn.addEventListener('click', () => {
        const text = 'value' in addrEl ? addrEl.value : addrEl.textContent;
        if (text) navigator.clipboard.writeText(text).catch(()=>{});
      });
    }
    if (ccySel) ccySel.addEventListener('change', update);
    if (netSel) netSel.addEventListener('change', update);
    update();
  }
  function initWithdraw() {
    const toAddr = document.querySelector('#withdrawTo, [data-withdraw-to]');
    const qrCv   = document.querySelector('#withdrawQr, [data-withdraw-qr]');
    const copyBtn= document.querySelector('[data-withdraw-copy]');
    function update() {
      const data = toAddr && ('value' in toAddr ? toAddr.value : toAddr.textContent);
      renderQR(qrCv, data || '');
    }
    if (copyBtn && toAddr) {
      copyBtn.addEventListener('click', () => {
        const text = 'value' in toAddr ? toAddr.value : toAddr.textContent;
        if (text) navigator.clipboard.writeText(text).catch(()=>{});
      });
    }
    if (toAddr) toAddr.addEventListener('input', update);
    update();
  }
  document.addEventListener('DOMContentLoaded', () => { initTopup(); initWithdraw(); });
})();
