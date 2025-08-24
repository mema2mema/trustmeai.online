Drop the folders into your project and add these tags above </body>:

<script src="./vendor/qrcode.min.js"></script>
<script>
  if (!window.QRCode) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
    document.head.appendChild(s);
  }
</script>
<script src="./addons/nav-fixes.js" defer></script>
<script src="./addons/click-cards.js" defer></script>
<script src="./addons/canonicalize-ref.js" defer></script>
<script src="./addons/referral-use.js" defer></script>
<script src="./addons/deposit-withdraw-qr.js" defer></script>

See README in zip for hook IDs/classes you need in your HTML.
