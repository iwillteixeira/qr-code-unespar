/* ─── app.js ─────────────────────────────────────────────────── */

// ── State ────────────────────────────────────────────────────────
let qrInstance = null;
let customLogoDataURL = null;

const state = {
  type:       'url',
  dotStyle:   'square',
  csStyle:    'square',
  cdStyle:    'square',
  fgColor:    '#003d72',
  bgColor:    '#ffffff',
  logo:       'unespar',   // 'unespar' | 'none' | 'custom'
  size:       400,
};

// ── DOM helpers ───────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ── Content type navigation ───────────────────────────────────────
$$('.type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    $$('.content-form').forEach(f => f.classList.remove('active'));
    $(`form-${btn.dataset.type}`).classList.add('active');
    state.type = btn.dataset.type;
  });
});

// ── Color sync (picker ↔ hex input) ──────────────────────────────
function syncColor(pickerId, hexId, stateKey) {
  const picker = $(pickerId), hex = $(hexId);
  picker.addEventListener('input', () => {
    hex.value = picker.value;
    state[stateKey] = picker.value;
  });
  hex.addEventListener('input', () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hex.value)) {
      picker.value = hex.value;
      state[stateKey] = hex.value;
    }
  });
}
syncColor('color-fg', 'hex-fg', 'fgColor');
syncColor('color-bg', 'hex-bg', 'bgColor');

// ── Shape buttons ─────────────────────────────────────────────────
function setupShapeGroup(selector, attr, stateKey) {
  $$(selector).forEach(btn => {
    btn.addEventListener('click', () => {
      $$(selector).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state[stateKey] = btn.dataset[attr];
    });
  });
}
setupShapeGroup('#dot-styles .shape-btn',          'dot', 'dotStyle');
setupShapeGroup('#corner-square-styles .shape-btn', 'cs',  'csStyle');
setupShapeGroup('#corner-dot-styles .shape-btn',    'cd',  'cdStyle');

// ── Logo options ──────────────────────────────────────────────────
$$('.logo-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    $$('.logo-opt').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    state.logo = opt.querySelector('input').value;

    if (state.logo === 'custom') {
      $('logo-upload').click();
      $('upload-hint').style.display = 'block';
    } else {
      $('upload-hint').style.display = 'none';
    }
  });
});

$('logo-upload').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    customLogoDataURL = ev.target.result;
    state.logo = 'custom';
  };
  reader.readAsDataURL(file);
});

// ── Quality slider ────────────────────────────────────────────────
$('quality-slider').addEventListener('input', e => {
  state.size = parseInt(e.target.value, 10);
  $('quality-px').textContent  = state.size;
  $('quality-px2').textContent = state.size;
});

// ── Build the encoded string ──────────────────────────────────────
function buildContent() {
  switch (state.type) {
    case 'url':
      return $('input-url').value.trim() || 'https://unespar.edu.br/';

    case 'text':
      return $('input-text').value.trim() || ' ';

    case 'email': {
      const to   = $('input-email-to').value.trim();
      const subj = $('input-email-subject').value.trim();
      const body = $('input-email-body').value.trim();
      let s = `mailto:${to}`;
      const params = [];
      if (subj) params.push(`subject=${encodeURIComponent(subj)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      if (params.length) s += '?' + params.join('&');
      return s;
    }

    case 'phone':
      return `tel:${$('input-phone').value.trim()}`;

    case 'sms': {
      const phone = $('input-sms-phone').value.trim();
      const msg   = $('input-sms-msg').value.trim();
      return msg ? `smsto:${phone}:${msg}` : `sms:${phone}`;
    }

    case 'whatsapp': {
      const phone = $('input-wa-phone').value.replace(/\D/g, '');
      const msg   = encodeURIComponent($('input-wa-msg').value.trim());
      return `https://wa.me/${phone}${msg ? '?text=' + msg : ''}`;
    }

    case 'wifi': {
      const ssid   = $('input-wifi-ssid').value.trim();
      const pass   = $('input-wifi-pass').value.trim();
      const sec    = $('input-wifi-sec').value;
      const hidden = $('input-wifi-hidden').checked ? 'true' : 'false';
      return `WIFI:T:${sec};S:${ssid};P:${pass};H:${hidden};;`;
    }

    case 'vcard': {
      const name    = $('vc-name').value.trim();
      const org     = $('vc-org').value.trim();
      const title   = $('vc-title').value.trim();
      const phone   = $('vc-phone').value.trim();
      const email   = $('vc-email').value.trim();
      const url     = $('vc-url').value.trim();
      const address = $('vc-address').value.trim();
      return [
        'BEGIN:VCARD', 'VERSION:3.0',
        name    ? `FN:${name}`       : '',
        org     ? `ORG:${org}`       : '',
        title   ? `TITLE:${title}`   : '',
        phone   ? `TEL:${phone}`     : '',
        email   ? `EMAIL:${email}`   : '',
        url     ? `URL:${url}`       : '',
        address ? `ADR:;;${address}` : '',
        'END:VCARD'
      ].filter(Boolean).join('\n');
    }

    default:
      return '';
  }
}

// ── Resolve logo image URL ────────────────────────────────────────
function getLogoImage() {
  if (state.logo === 'none') return undefined;
  if (state.logo === 'custom') return customLogoDataURL || undefined;
  if (state.logo === 'unespar2') return 'assets/logo-unespar-2.jpg';
  if (state.logo === 'unespar3') return 'assets/logo-unespar-3.jpg';
  // unespar — use local asset
  return 'assets/logo-unespar.png';
}

// ── Generate QR Code ──────────────────────────────────────────────
$('btn-create').addEventListener('click', () => {
  const content = buildContent();
  if (!content.trim()) return;

  const logoImg = getLogoImage();

  const options = {
    width:  state.size,
    height: state.size,
    data:   content,
    margin: 2,
    qrOptions: {
      errorCorrectionLevel: logoImg ? 'H' : 'M',
    },
    dotsOptions: {
      type:  state.dotStyle,
      color: state.fgColor,
    },
    cornersSquareOptions: {
      type:  state.csStyle,
      color: state.fgColor,
    },
    cornersDotOptions: {
      type:  state.cdStyle,
      color: state.fgColor,
    },
    backgroundOptions: {
      color: state.bgColor,
    },
    imageOptions: logoImg ? {
      hideBackgroundDots: true,
      imageSize:          0.38,
      margin:             6,
      crossOrigin:        'anonymous',
    } : undefined,
    image: logoImg,
  };

  // clear previous
  const output = $('qr-output');
  output.innerHTML = '';

  qrInstance = new QRCodeStyling(options);
  qrInstance.append(output);

  output.style.display      = 'block';
  $('qr-placeholder').style.display  = 'none';
  $('download-btns').style.display   = 'flex';
  $('encoded-preview').style.display = 'block';
  $('encoded-text').textContent      = content;
});

// ── Downloads ─────────────────────────────────────────────────────
$('btn-dl-png').addEventListener('click', () => {
  if (!qrInstance) return;
  qrInstance.download({ name: 'qr-unespar', extension: 'png' });
});

$('btn-dl-svg').addEventListener('click', () => {
  if (!qrInstance) return;
  qrInstance.download({ name: 'qr-unespar', extension: 'svg' });
});
