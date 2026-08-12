/**
 * Peru Nature - Reservas, clientes, cupones y PayPal en Google Sheets
 *
 * CONFIGURACIÓN RÁPIDA
 * 1) Crea un Google Sheet y copia su ID en SPREADSHEET_ID.
 * 2) En Apps Script > Project Settings > Script properties agrega:
 *    PAYPAL_CLIENT_ID = tu client id
 *    PAYPAL_CLIENT_SECRET = tu secret id
 *    PAYPAL_ENV = sandbox  // cambia a live en producción
 * 3) Deploy > New deployment > Web app:
 *    Execute as: Me
 *    Who has access: Anyone
 * 4) Copia la URL Web App en product.html, login.html, registro.html, perfil.html y mi-reserva.html:
 *    window.PN_APPS_SCRIPT_URL = "TU_URL";
 */
const SPREADSHEET_ID = 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET';

function doPost(e) {
  try {
    const body = JSON.parse((e.postData && e.postData.contents) || '{}');
    const action = String(body.action || 'saveReservation');
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (action === 'registerCustomer') return registerCustomer_(ss, body.customer || {});
    if (action === 'loginCustomer') return loginCustomer_(ss, body.email || '', body.password || '');
    if (action === 'getCustomerReservations') return getCustomerReservations_(ss, body.email || '', body.token || '');
    if (action === 'saveReservation') return saveReservation_(ss, body.reservation || body);
    if (action === 'createPayPalOrder') return createPayPalOrder_(ss, body.reservation || {});
    if (action === 'capturePayPalOrder') return capturePayPalOrder_(ss, body.orderID || '', body.reservation || {});
    if (action === 'submitComplaint') return submitComplaint_(ss, body.complaint || {});
    if (action === 'submitOperatorApplication') return submitOperatorApplication_(ss, body.application || {});
    if (action === 'registerOperator') return registerOperator_(ss, body.operator || {});
    if (action === 'loginOperator') return loginOperator_(ss, body.email || '', body.password || '');

    return json_({ ok: false, message: 'Acción no válida.' });
  } catch (error) {
    return json_({ ok: false, message: error.message });
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const action = String((e.parameter && e.parameter.action) || '').toLowerCase();
  if (action === 'coupon') return findCoupon_(ss, e.parameter.code || '');
  if (action === 'reservation') return findReservation_(ss, e.parameter.code || '', e.parameter.lastname || '');
  return json_({ ok: false, message: 'Acción no válida.' });
}

function saveReservation_(ss, payload) {
  const reservations = getOrCreateSheet_(ss, 'Reservations', [
    'createdAt', 'code', 'tourSlug', 'tourTitle', 'destination', 'adults', 'children',
    'baseSubtotal', 'hotel', 'room', 'hotelSubtotal', 'coupon', 'discountPercent', 'discount',
    'total', 'currency', 'contactEmail', 'contactPhone', 'customerEmail', 'paymentStatus', 'paypalId'
  ]);
  const passengers = getOrCreateSheet_(ss, 'Passengers', [
    'code', 'passenger', 'name', 'lastname', 'documentType', 'documentNumber', 'nationality', 'birthdate', 'gender', 'language'
  ]);

  const code = payload.code || createFallbackReservationCode_();
  const customer = payload.customer || {};
  const contact = payload.contact || {};

  upsertRowByKey_(reservations, 'code', code, [
    payload.createdAt || new Date().toISOString(),
    code,
    payload.tourSlug || '',
    payload.tourTitle || '',
    payload.destination || '',
    payload.adults || 0,
    payload.children || 0,
    payload.baseSubtotal || 0,
    payload.hotel || '',
    payload.room || '',
    payload.hotelSubtotal || 0,
    payload.coupon || '',
    payload.discountPercent || 0,
    payload.discount || 0,
    payload.total || 0,
    payload.currency || 'USD',
    contact.email || '',
    contact.phone || '',
    customer.email || '',
    payload.paymentStatus || 'pending',
    payload.paypalId || ''
  ]);

  removePassengerRows_(passengers, code);
  (payload.passengers || []).forEach(function (p) {
    passengers.appendRow([
      code,
      p.passenger || '',
      p.name || '',
      p.lastname || '',
      p.documentType || '',
      p.documentNumber || '',
      p.nationality || '',
      p.birthdate || '',
      p.gender || '',
      p.language || ''
    ]);
  });

  return json_({ ok: true, code: code });
}

function registerCustomer_(ss, customer) {
  const sheet = getOrCreateSheet_(ss, 'Customers', [
    'createdAt', 'email', 'passwordHash', 'names', 'lastnames', 'whatsapp', 'birthdate', 'gender', 'nationality', 'language', 'documentType', 'documentNumber'
  ]);
  const email = String(customer.email || '').trim().toLowerCase();
  const password = String(customer.password || '');
  if (!email || !password) return json_({ ok: false, message: 'Correo y contraseña son obligatorios.' });

  const values = sheet.getDataRange().getValues();
  const header = values.shift();
  const emailIndex = header.indexOf('email');
  const exists = values.some(function (row) { return String(row[emailIndex] || '').trim().toLowerCase() === email; });
  if (exists) return json_({ ok: false, message: 'Este correo ya está registrado.' });

  const record = [
    new Date().toISOString(),
    email,
    hashPassword_(password),
    customer.names || '',
    customer.lastnames || '',
    customer.whatsapp || '',
    customer.birthdate || '',
    customer.gender || '',
    customer.nationality || '',
    customer.language || '',
    customer.documentType || '',
    customer.documentNumber || ''
  ];
  sheet.appendRow(record);
  const publicCustomer = publicCustomer_(rowToObject_(header, record));
  const token = createSession_(ss, email);
  return json_({ ok: true, customer: publicCustomer, token: token });
}

function loginCustomer_(ss, email, password) {
  const sheet = getOrCreateSheet_(ss, 'Customers', []);
  const values = sheet.getDataRange().getValues();
  if (!values.length) return json_({ ok: false, message: 'No hay clientes registrados.' });
  const header = values.shift();
  const emailIndex = header.indexOf('email');
  const hashIndex = header.indexOf('passwordHash');
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const row = values.find(function (r) { return String(r[emailIndex] || '').trim().toLowerCase() === normalizedEmail; });
  if (!row || String(row[hashIndex] || '') !== hashPassword_(String(password || ''))) {
    return json_({ ok: false, message: 'Correo o contraseña incorrectos.' });
  }
  const token = createSession_(ss, normalizedEmail);
  return json_({ ok: true, customer: publicCustomer_(rowToObject_(header, row)), token: token });
}

function getCustomerReservations_(ss, email, token) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!validateSession_(ss, normalizedEmail, token)) {
    return json_({ ok: false, message: 'Sesión no válida. Vuelve a iniciar sesión.' });
  }

  const reservations = getOrCreateSheet_(ss, 'Reservations', []);
  const values = reservations.getDataRange().getValues();
  if (!values.length) return json_({ ok: true, reservations: [] });

  const header = values.shift();
  const customerEmailIndex = header.indexOf('customerEmail');
  const contactEmailIndex = header.indexOf('contactEmail');
  const results = values
    .filter(function (row) {
      return String(row[customerEmailIndex] || row[contactEmailIndex] || '').trim().toLowerCase() === normalizedEmail;
    })
    .map(function (row) { return rowToObject_(header, row); })
    .sort(function (a, b) { return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); });

  return json_({ ok: true, reservations: results });
}

function findCoupon_(ss, rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  const sheet = getOrCreateSheet_(ss, 'Coupons', ['code', 'percent', 'expiresAt', 'active']);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const row = values.find(function (r) { return String(r[0] || '').trim().toUpperCase() === code; });
  if (!row) return json_({ ok: false, status: 'not_found' });
  const expiresAt = row[2] instanceof Date ? Utilities.formatDate(row[2], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(row[2] || '');
  const expired = expiresAt && new Date(expiresAt + 'T23:59:59') < new Date();
  const active = String(row[3]).toLowerCase() !== 'false';
  if (!active) return json_({ ok: false, status: 'inactive' });
  if (expired) return json_({ ok: false, status: 'expired' });
  return json_({ ok: true, code: code, percent: Number(row[1] || 0), expiresAt: expiresAt });
}

function findReservation_(ss, code, lastname) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const normalizedLastname = String(lastname || '').trim().toLowerCase();
  const reservations = getOrCreateSheet_(ss, 'Reservations', []);
  const passengers = getOrCreateSheet_(ss, 'Passengers', []);
  const reservationRows = reservations.getDataRange().getValues();
  const passengerRows = passengers.getDataRange().getValues();
  if (!reservationRows.length) return json_({ ok: false, status: 'not_found' });
  const reservationHeader = reservationRows.shift();
  const passengerHeader = passengerRows.shift() || [];
  const codeIndex = reservationHeader.indexOf('code');
  const passengerCodeIndex = passengerHeader.indexOf('code');
  const passengerLastnameIndex = passengerHeader.indexOf('lastname');

  const reservation = reservationRows.find(function (r) { return String(r[codeIndex] || '').trim().toUpperCase() === normalizedCode; });
  if (!reservation) return json_({ ok: false, status: 'not_found' });

  const passengersFound = passengerRows.filter(function (r) { return String(r[passengerCodeIndex] || '').trim().toUpperCase() === normalizedCode; });
  const matchingPassenger = !normalizedLastname || passengersFound.some(function (r) {
    return String(r[passengerLastnameIndex] || '').trim().toLowerCase() === normalizedLastname;
  });
  if (!matchingPassenger) return json_({ ok: false, status: 'lastname_mismatch' });

  return json_({
    ok: true,
    reservation: rowToObject_(reservationHeader, reservation),
    passengers: passengersFound.map(function (r) { return rowToObject_(passengerHeader, r); })
  });
}

function submitComplaint_(ss, complaint) {
  const sheet = getOrCreateSheet_(ss, 'Complaints', [
    'createdAt', 'folio', 'type', 'consumerName', 'consumerDocType', 'consumerDocNumber',
    'consumerAddress', 'consumerPhone', 'consumerEmail', 'guardianName', 'serviceType',
    'serviceDescription', 'claimedAmount', 'detail', 'request', 'status'
  ]);

  const email = String(complaint.consumerEmail || '').trim();
  const detail = String(complaint.detail || '').trim();
  if (!email || !detail) return json_({ ok: false, message: 'Correo y detalle del reclamo son obligatorios.' });

  const folio = 'PNQ' + Date.now().toString(16).toUpperCase().slice(-8);
  sheet.appendRow([
    new Date().toISOString(),
    folio,
    complaint.type || 'reclamo',
    complaint.consumerName || '',
    complaint.consumerDocType || '',
    complaint.consumerDocNumber || '',
    complaint.consumerAddress || '',
    complaint.consumerPhone || '',
    email,
    complaint.guardianName || '',
    complaint.serviceType || '',
    complaint.serviceDescription || '',
    complaint.claimedAmount || '',
    detail,
    complaint.request || '',
    'Recibido'
  ]);

  return json_({ ok: true, folio: folio });
}

function submitOperatorApplication_(ss, application) {
  const sheet = getOrCreateSheet_(ss, 'OperatorApplications', [
    'createdAt', 'companyName', 'category', 'ruc', 'region', 'contactName', 'email', 'whatsapp',
    'website', 'yearsExperience', 'servicesOffered', 'message', 'status'
  ]);

  const email = String(application.email || '').trim();
  const companyName = String(application.companyName || '').trim();
  if (!email || !companyName) return json_({ ok: false, message: 'Empresa y correo son obligatorios.' });

  sheet.appendRow([
    new Date().toISOString(),
    companyName,
    application.category || '',
    application.ruc || '',
    application.region || '',
    application.contactName || '',
    email,
    application.whatsapp || '',
    application.website || '',
    application.yearsExperience || '',
    application.servicesOffered || '',
    application.message || '',
    'Nueva'
  ]);

  return json_({ ok: true });
}

function registerOperator_(ss, operator) {
  const sheet = getOrCreateSheet_(ss, 'Operators', [
    'createdAt', 'email', 'passwordHash', 'companyName', 'ruc', 'contactName', 'whatsapp', 'region', 'status'
  ]);
  const email = String(operator.email || '').trim().toLowerCase();
  const password = String(operator.password || '');
  if (!email || !password) return json_({ ok: false, message: 'Correo y contraseña son obligatorios.' });

  const values = sheet.getDataRange().getValues();
  const header = values.shift();
  const emailIndex = header.indexOf('email');
  const exists = values.some(function (row) { return String(row[emailIndex] || '').trim().toLowerCase() === email; });
  if (exists) return json_({ ok: false, message: 'Este correo ya está registrado.' });

  sheet.appendRow([
    new Date().toISOString(),
    email,
    hashPassword_(password),
    operator.companyName || '',
    operator.ruc || '',
    operator.contactName || '',
    operator.whatsapp || '',
    operator.region || '',
    'Pendiente'
  ]);

  return json_({ ok: true, message: 'Registro recibido. Un asesor validará tu cuenta antes de habilitar el acceso.' });
}

function loginOperator_(ss, email, password) {
  const sheet = getOrCreateSheet_(ss, 'Operators', []);
  const values = sheet.getDataRange().getValues();
  if (!values.length) return json_({ ok: false, message: 'No hay operadores registrados.' });
  const header = values.shift();
  const emailIndex = header.indexOf('email');
  const hashIndex = header.indexOf('passwordHash');
  const statusIndex = header.indexOf('status');
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const row = values.find(function (r) { return String(r[emailIndex] || '').trim().toLowerCase() === normalizedEmail; });
  if (!row || String(row[hashIndex] || '') !== hashPassword_(String(password || ''))) {
    return json_({ ok: false, message: 'Correo o contraseña incorrectos.' });
  }
  const status = String(row[statusIndex] || '').toLowerCase();
  if (status !== 'aprobado' && status !== 'activo') {
    return json_({ ok: false, message: 'Tu cuenta de operador aún está en revisión. Te avisaremos apenas esté activa.' });
  }
  const token = createSession_(ss, normalizedEmail);
  return json_({ ok: true, operator: publicCustomer_(rowToObject_(header, row)), token: token });
}

function createPayPalOrder_(ss, reservation) {
  const amount = Math.max(1, Number(reservation.total || 0)).toFixed(2);
  const currency = reservation.currency || 'USD';
  const code = reservation.code || createFallbackReservationCode_();
  const response = paypalFetch_('/v2/checkout/orders', 'post', {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: code,
      description: String(reservation.tourTitle || 'Reserva Peru Nature').slice(0, 120),
      amount: { currency_code: currency, value: amount }
    }]
  });
  reservation.paypalId = response.id;
  reservation.paymentStatus = 'created';
  saveReservation_(ss, reservation);
  return json_({ ok: true, orderID: response.id });
}

function capturePayPalOrder_(ss, orderID, reservation) {
  if (!orderID) return json_({ ok: false, message: 'Falta orderID.' });
  const response = paypalFetch_('/v2/checkout/orders/' + encodeURIComponent(orderID) + '/capture', 'post', {});
  reservation.paypalId = orderID;
  reservation.paymentStatus = response.status || 'paid';
  saveReservation_(ss, reservation);
  return json_({ ok: true, orderID: orderID, id: orderID, status: response.status || 'paid' });
}

function paypalFetch_(path, method, payload) {
  const props = PropertiesService.getScriptProperties();
  const env = String(props.getProperty('PAYPAL_ENV') || 'sandbox').toLowerCase();
  const base = env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const clientId = props.getProperty('PAYPAL_CLIENT_ID');
  const secret = props.getProperty('PAYPAL_CLIENT_SECRET');
  if (!clientId || !secret) throw new Error('Faltan PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET en Script Properties.');

  const tokenResponse = UrlFetchApp.fetch(base + '/v1/oauth2/token', {
    method: 'post',
    payload: 'grant_type=client_credentials',
    headers: { Authorization: 'Basic ' + Utilities.base64Encode(clientId + ':' + secret) },
    muteHttpExceptions: true
  });
  const tokenJson = JSON.parse(tokenResponse.getContentText() || '{}');
  if (!tokenJson.access_token) throw new Error('No se pudo obtener access token de PayPal: ' + tokenResponse.getContentText());

  const options = {
    method: method,
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + tokenJson.access_token },
    muteHttpExceptions: true
  };
  if (payload && Object.keys(payload).length) options.payload = JSON.stringify(payload);
  const apiResponse = UrlFetchApp.fetch(base + path, options);
  const text = apiResponse.getContentText() || '{}';
  const json = JSON.parse(text);
  if (apiResponse.getResponseCode() >= 400) throw new Error('PayPal error: ' + text);
  return json;
}

function getOrCreateSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (headers && headers.length && sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}

function upsertRowByKey_(sheet, keyName, keyValue, rowValues) {
  const values = sheet.getDataRange().getValues();
  if (!values.length) {
    sheet.appendRow(rowValues);
    return;
  }
  const header = values[0];
  const keyIndex = header.indexOf(keyName);
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][keyIndex] || '') === String(keyValue)) {
      sheet.getRange(i + 1, 1, 1, rowValues.length).setValues([rowValues]);
      return;
    }
  }
  sheet.appendRow(rowValues);
}

function removePassengerRows_(sheet, code) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return;
  const header = values[0];
  const codeIndex = header.indexOf('code');
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][codeIndex] || '') === String(code)) sheet.deleteRow(i + 1);
  }
}


function createSession_(ss, email) {
  const sheet = getOrCreateSheet_(ss, 'Sessions', ['createdAt', 'email', 'token', 'expiresAt']);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 30);
  const seed = email + '|' + createdAt.toISOString() + '|' + Math.random();
  const token = hashPassword_(seed);
  sheet.appendRow([createdAt.toISOString(), String(email || '').trim().toLowerCase(), token, expiresAt.toISOString()]);
  return token;
}

function validateSession_(ss, email, token) {
  if (!email || !token) return false;
  const sheet = getOrCreateSheet_(ss, 'Sessions', ['createdAt', 'email', 'token', 'expiresAt']);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return false;
  const header = values.shift();
  const emailIndex = header.indexOf('email');
  const tokenIndex = header.indexOf('token');
  const expiresIndex = header.indexOf('expiresAt');
  const now = new Date();
  return values.some(function (row) {
    const rowEmail = String(row[emailIndex] || '').trim().toLowerCase();
    const rowToken = String(row[tokenIndex] || '').trim();
    const expiresAt = new Date(row[expiresIndex] || 0);
    return rowEmail === String(email || '').trim().toLowerCase() && rowToken === String(token || '').trim() && expiresAt > now;
  });
}

function rowToObject_(headers, row) {
  return headers.reduce(function (obj, header, index) {
    obj[header] = row[index];
    return obj;
  }, {});
}

function publicCustomer_(record) {
  delete record.passwordHash;
  return record;
}

function hashPassword_(password) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password || ''), Utilities.Charset.UTF_8);
  return raw.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function createFallbackReservationCode_() {
  return 'PNAT' + Date.now().toString(16).toUpperCase().slice(-8);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
