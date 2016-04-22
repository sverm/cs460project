var openpgp = window.openpgp;

openpgp.initWorker({ path:'bower_components/openpgp/dist/openpgp.worker.js' }) // set the relative web worker path

openpgp.config.aead_protect = true // activate fast AES-GCM mode (experimental)

function pgp_encrypt() {
  var options = {
    data: document.getElementById('input').value,
    passwords:[document.getElementById('password').value]
  };
  openpgp.encrypt(options).then(show_result);
}

function pgp_decrypt() {
  var options = {
    message: openpgp.message.readArmored(document.getElementById('input').value),
    password: document.getElementById('password').value
  };
  openpgp.decrypt(options).then(show_result);
}

function show_result(result) {
  document.getElementById('result').value = result && result.data ? result.data : result;
}

function aes_encrypt() {
  var message = document.getElementById('input').value;
  var key = document.getElementById('password').value;
  var iv  = '0000000000000000';
  var encrypted = CryptoJS.AES.encrypt(message, key);
  show_result(encrypted);
}

function aes_decrypt() {
  var data = document.getElementById('input').value;
  var key = document.getElementById('password').value;
  show_result(CryptoJS.AES.decrypt(data,key).toString(CryptoJS.enc.Utf8));
}

document.getElementById('pgp_encrypt').onclick = pgp_encrypt;
document.getElementById('pgp_decrypt').onclick = pgp_decrypt;
document.getElementById('aes_encrypt').onclick = aes_encrypt;
document.getElementById('aes_decrypt').onclick = aes_decrypt;
