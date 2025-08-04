//contract_form.js

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', function () {
  const nameInput = document.getElementById('name');
  const surnameInput = document.getElementById('surname');
  const phoneInput = document.getElementById('phone');
  const otpSendBtn = document.getElementById('otp-send-btn');
  const otpInputs = [
    document.getElementById('otp-code-1'),
    document.getElementById('otp-code-2'),
    document.getElementById('otp-code-3'),
    document.getElementById('otp-code-4')
  ];
  const otpStatus = document.getElementById('otp-status');
  const emailInput = document.getElementById('email');
  const showCompany = document.getElementById('show-company');
  const companyBlock = document.getElementById('company-block');
  const companyInput = document.getElementById('company');
  const positionInput = document.getElementById('position');
  const messageDropdown = document.getElementById('message-dropdown');
  const submitBtn = document.getElementById('contact-submit-btn');
  const form = document.getElementById('contact-form-fields');
  const dropdownBtn = document.getElementById('dropdown-btn');
  const dropdownList = document.getElementById('dropdown-list');
  const dropdownSelected = document.getElementById('dropdown-selected');
  const phoneRow = document.getElementById('contact-phone-row');
  const otpBlock = document.getElementById('otp-block');
  const contactFormContent = document.getElementById('contact-form-content');
  const contactFormSuccess = document.getElementById('contact-form-success');

  const nameStatus = document.getElementById('name-status');
  const surnameStatus = document.getElementById('surname-status');
  const phoneStatus = document.getElementById('phone-status');
  const emailStatus = document.getElementById('email-status');
  const companyStatus = document.getElementById('company-status');
  const positionStatus = document.getElementById('position-status');
  const messageStatus = document.getElementById('message-status');

  let phoneVerified = false;
  let otpRequested = false;
  let lastErrors = {};
  let otpConfirmed = false; // [DC Source][FIXED] для состояния "успешно подтверждён"

  let otpAttempts = [0, 0, 0, 0];
  const maxOtpAttempts = 2;

  // [DC Source][NEW] Отслеживаем был ли фокус/blur для каждого поля
  let wasFocus = {
    name: false,
    surname: false,
    email: false,
    phone: false,
    company: false,
    position: false
  };
  let wasBlur = {
    name: false,
    surname: false,
    email: false,
    phone: false,
    company: false,
    position: false
  };

  nameInput.addEventListener('focus', function() { wasFocus.name = true; });
  surnameInput.addEventListener('focus', function() { wasFocus.surname = true; });
  emailInput.addEventListener('focus', function() { wasFocus.email = true; });
  phoneInput.addEventListener('focus', function() { wasFocus.phone = true; });
  if (companyInput) companyInput.addEventListener('focus', function() { wasFocus.company = true; });
  if (positionInput) positionInput.addEventListener('focus', function() { wasFocus.position = true; });

  nameInput.addEventListener('blur', function() {
    wasBlur.name = true; updateStatusLabels(lastErrors);
  });
  surnameInput.addEventListener('blur', function() {
    wasBlur.surname = true; updateStatusLabels(lastErrors);
  });
  emailInput.addEventListener('blur', function() {
    wasBlur.email = true; updateStatusLabels(lastErrors);
  });
  phoneInput.addEventListener('blur', function() {
    wasBlur.phone = true; updateStatusLabels(lastErrors);
  });
  if (companyInput) companyInput.addEventListener('blur', function() {
    wasBlur.company = true; updateStatusLabels(lastErrors);
  });
  if (positionInput) positionInput.addEventListener('blur', function() {
    wasBlur.position = true; updateStatusLabels(lastErrors);
  });

  // [DC Source][FIXED] Проверка компании/должности обе обязательны если галочка
  // [DC Source][FIXED] Теперь разрешены русские, английские, казахские буквы, пробелы, дефисы для имени, фамилии, должности
  // [DC Source][FIXED] Наименование компании: разрешаем буквы (рус, англ, каз), пробелы, дефисы, тире, кавычки, восклицательные знаки
  function validateCompany() {
    if (!showCompany.checked) return true;
    return companyInput.value.trim().length >= 2 &&
      /^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-–—"'!]+$/.test(companyInput.value.trim());
  }
  function validatePosition() {
    if (!showCompany.checked) return true;
    const val = positionInput.value.trim();
    return val.length >= 3 &&
      /^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-]+$/.test(val);
  }
  function isCompanyAndPositionFilled() {
    if (!showCompany.checked) return true;
    return (
      companyInput.value.trim().length >= 2 &&
      /^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-–—"'!]+$/.test(companyInput.value.trim()) &&
      positionInput.value.trim().length >= 3 &&
      /^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-]+$/.test(positionInput.value.trim())
    );
  }

  function updateSurnamePlaceholder() {
    const nameVal = nameInput.value.trim();
    if (nameVal.length <= 2) {
      surnameInput.placeholder = "*Фамилия";
      surnameInput.required = true;
    } else {
      surnameInput.placeholder = "Фамилия";
      surnameInput.required = false;
    }
  }
  // [DC Source][FIXED] Фамилия: разрешаем буквы (рус, англ, каз), пробелы, дефисы
  function validateSurname() {
    const nameVal = nameInput.value.trim();
    const val = surnameInput.value.trim();
    if (nameVal.length <= 2) {
      return /^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-]+$/.test(val);
    }
    return val === '' || /^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-]+$/.test(val);
  }
  // [DC Source][FIXED] Имя: разрешаем буквы (рус, англ, каз), пробелы, дефисы
  function validateName() {
    const val = nameInput.value.trim();
    return /^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-]{2,}$/.test(val);
  }

  // [DC Source][FIXED] Проверяем оба формата!
  function validatePhone() {
    const val = phoneInput.value.trim();
    return (
      (/^\+7\d{10}$/.test(val) || /^8\d{10}$/.test(val)) &&
      phoneVerified
    );
  }

  function validateEmail() {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(emailInput.value.trim());
  }
  function validateMessage() {
    const checked = dropdownList.querySelectorAll('input[type="checkbox"]:checked');
    return checked.length > 0;
  }

  function updateSubmitBtn() {
    const nameVal = nameInput.value.trim();
    let surnameValid = true;
    if (nameVal.length < 2) {
      surnameValid = /^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-]+$/.test(surnameInput.value.trim());
    } else {
      surnameValid = surnameInput.value.trim() === '' || /^[A-Za-zА-Яа-яЁёІіҢңҒғҮүҰұҚқҺһӨөӘәҚқ\s\-]+$/.test(surnameInput.value.trim());
    }
    submitBtn.disabled = !(
      validateName() &&
      surnameValid &&
      validatePhone() &&
      validateEmail() &&
      validateCompany() &&
      validatePosition() &&
      validateMessage() &&
      isCompanyAndPositionFilled()
    );
  }

  // [DC Source][FIXED] Подсказки только после focus+blur, мигают при ошибке
  function updateStatusLabels(errors = {}) {
    if (errors.name) {
      if (wasFocus.name && wasBlur.name) {
        nameStatus.textContent = errors.name[0];
        nameStatus.style.color = "#c00";
        flashLabel(nameStatus);
      } else {
        nameStatus.textContent = "";
        nameStatus.classList.remove('flash');
      }
    } else if (validateName()) {
      nameStatus.textContent = "✓ Имя корректно";
      nameStatus.style.color = "#090";
      nameStatus.classList.remove('flash');
    } else if (wasFocus.name && wasBlur.name) {
      nameStatus.textContent = "Имя должно содержать минимум 2 буквы (латиница, кириллица, казахские буквы, пробел, дефис)";
      nameStatus.style.color = "#c00";
      flashLabel(nameStatus);
    } else {
      nameStatus.textContent = "";
      nameStatus.classList.remove('flash');
    }
    if (errors.surname) {
      if (wasFocus.surname && wasBlur.surname) {
        surnameStatus.textContent = errors.surname[0];
        surnameStatus.style.color = "#c00";
        flashLabel(surnameStatus);
      } else {
        surnameStatus.textContent = "";
        surnameStatus.classList.remove('flash');
      }
    } else if (validateSurname()) {
      surnameStatus.textContent = "";
      surnameStatus.style.color = "#090";
      surnameStatus.classList.remove('flash');
    } else if (wasFocus.surname && wasBlur.surname) {
      surnameStatus.textContent = "Фамилия должна содержать минимум 1 букву (латиница, кириллица, казахские буквы, пробел, дефис)";
      surnameStatus.style.color = "#c00";
      flashLabel(surnameStatus);
    } else {
      surnameStatus.textContent = "";
      surnameStatus.classList.remove('flash');
    }
    if (errors.email) {
      if (wasFocus.email && wasBlur.email) {
        emailStatus.textContent = errors.email[0];
        emailStatus.style.color = "#c00";
        flashLabel(emailStatus);
      } else {
        emailStatus.textContent = "";
        emailStatus.classList.remove('flash');
      }
    } else if (validateEmail()) {
      emailStatus.textContent = "✓ E-mail корректный";
      emailStatus.style.color = "#090";
      emailStatus.classList.remove('flash');
    } else if (wasFocus.email && wasBlur.email) {
      emailStatus.textContent = "E-mail некорректный";
      emailStatus.style.color = "#c00";
      flashLabel(emailStatus);
    } else {
      emailStatus.textContent = "";
      emailStatus.classList.remove('flash');
    }
    if (errors.phone) {
      if (wasFocus.phone && wasBlur.phone) {
        phoneStatus.textContent = errors.phone[0];
        phoneStatus.style.display = "";
        phoneStatus.style.color = "#c00";
        flashLabel(phoneStatus);
      } else {
        phoneStatus.textContent = "";
        phoneStatus.classList.remove('flash');
      }
    } else if (otpBlock.style.display === "flex" || phoneVerified) {
      phoneStatus.textContent = "";
      phoneStatus.style.display = "none";
      phoneStatus.classList.remove('flash');
    } else if ((/^\+7\d{10}$/.test(phoneInput.value.trim()) || /^8\d{10}$/.test(phoneInput.value.trim()))) {
      phoneStatus.textContent = "";
      phoneStatus.style.display = "none";
      phoneStatus.classList.remove('flash');
    } else if (wasFocus.phone && wasBlur.phone) {
      phoneStatus.textContent = "Формат: +7XXXXXXXXXX или 8XXXXXXXXXX";
      phoneStatus.style.display = "";
      phoneStatus.style.color = "#c00";
      flashLabel(phoneStatus);
    } else {
      phoneStatus.textContent = "";
      phoneStatus.classList.remove('flash');
    }

    if (showCompany.checked) {
      if (!validateCompany()) {
        if (wasFocus.company && wasBlur.company) {
          companyStatus.textContent = "Название компании должно быть минимум 2 буквы (русский, казахский, английский алфавит, пробел, дефис, тире, кавычки, !)";
          companyStatus.style.color = "#c00";
          flashLabel(companyStatus);
        } else {
          companyStatus.textContent = "";
          companyStatus.classList.remove('flash');
        }
      } else {
        companyStatus.textContent = "";
        companyStatus.style.color = "#090";
        companyStatus.classList.remove('flash');
      }
      if (!validatePosition()) {
        if (wasFocus.position && wasBlur.position) {
          positionStatus.textContent = "Должность должна быть минимум 3 буквы (латиница, кириллица, казахские буквы, пробел, дефис)";
          positionStatus.style.color = "#c00";
          flashLabel(positionStatus);
        } else {
          positionStatus.textContent = "";
          positionStatus.classList.remove('flash');
        }
      } else {
        positionStatus.textContent = "";
        positionStatus.style.color = "#090";
        positionStatus.classList.remove('flash');
      }
    } else {
      companyStatus.textContent = "";
      companyStatus.style.color = "#090";
      companyStatus.classList.remove('flash');
      positionStatus.textContent = "";
      positionStatus.style.color = "#090";
      positionStatus.classList.remove('flash');
    }

    if (errors.message) {
      messageStatus.textContent = errors.message[0];
      messageStatus.style.color = "#c00";
      flashLabel(messageStatus);
    } else if (validateMessage()) {
      messageStatus.textContent = "✓ Выбрано";
      messageStatus.style.color = "#090";
      messageStatus.classList.remove('flash');
    } else {
      messageStatus.textContent = "Нужно выбрать хотя бы один пункт!";
      messageStatus.style.color = "#c00";
      messageStatus.classList.remove('flash');
    }

    if (otpBlock.style.display === "flex" && otpConfirmed) {
      otpInputs.forEach(inp => inp.disabled = true);
      otpStatus.textContent = "Номер успешно подтверждён!";
      otpStatus.style.display = "";
      otpStatus.classList.remove('flash');
    }
    else if (otpBlock.style.display === "flex") {
      otpStatus.style.display = "";
      otpStatus.classList.remove('flash');
    } else {
      otpStatus.style.display = "none";
      otpStatus.classList.remove('flash');
    }

    updateSubmitBtn();
  }

  function flashLabel(labelElem) {
    labelElem.classList.add('flash');
    setTimeout(() => labelElem.classList.remove('flash'), 1200);
  }

  nameInput.addEventListener('input', function() {
    updateSurnamePlaceholder();
    updateStatusLabels(lastErrors);
    updateSubmitBtn();
  });
  surnameInput.addEventListener('input', function() {
    updateStatusLabels(lastErrors);
    updateSubmitBtn();
  });
  phoneInput.addEventListener('input', () => { phoneVerified = false; updateStatusLabels(lastErrors); updateSubmitBtn(); });
  emailInput.addEventListener('input', () => { updateStatusLabels(lastErrors); updateSubmitBtn(); });
  companyInput && companyInput.addEventListener('input', () => { updateStatusLabels(lastErrors); updateSubmitBtn(); });
  positionInput && positionInput.addEventListener('input', () => { updateStatusLabels(lastErrors); updateSubmitBtn(); });
  showCompany.addEventListener('change', function () {
    companyBlock.style.display = showCompany.checked ? "flex" : "none";
    updateStatusLabels(lastErrors);
    updateSubmitBtn();
  });
  dropdownList.addEventListener('change', () => { updateStatusLabels(lastErrors); updateSubmitBtn(); });

  otpSendBtn.addEventListener('click', function () {
    let phone = phoneInput.value.trim();
    let phoneToSend = phone;

    // [DC Source][FIXED] Сначала удаляем классы выделения статуса
    otpStatus.classList.remove('status-danger', 'status-info');

    if (/^8\d{10}$/.test(phone)) {
      phoneToSend = "+7" + phone.substr(1);
    }
    if (!/^\+7\d{10}$/.test(phoneToSend)) {
      otpStatus.textContent = "Введите номер в формате +7XXXXXXXXXX или 8XXXXXXXXXX";
      otpStatus.style.display = "";
      // [DC Source][FIXED] Выделяем ошибку через danger
      otpStatus.classList.add('status-danger');
      return;
    }
    fetch('/contact/request_sms/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrftoken
      },
      body: `phone=${encodeURIComponent(phoneToSend)}`
    })
    .then(resp => resp.json())
    .then(data => {
      otpStatus.classList.remove('status-danger', 'status-info');
      if (data.ok) {
        otpRequested = true;
        otpConfirmed = false;
        phoneRow.style.display = "none";
        otpBlock.style.display = "flex";
        otpStatus.textContent = "Код отправлен!";
        otpStatus.style.display = "";
        // [DC Source][FIXED] Выделяем информационный статус
        otpStatus.classList.add('status-info');
        otpInputs.forEach(inp => { inp.disabled = false; inp.value = ""; });
        otpInputs[0].focus();
        otpAttempts = [0, 0, 0, 0];
        updateStatusLabels(lastErrors);
      } else {
        otpStatus.textContent = data.error || "Ошибка";
        otpStatus.style.display = "";
        // [DC Source][FIXED] Выделяем ошибку через danger
        otpStatus.classList.add('status-danger');
      }
    })
    .catch(err => {
      otpStatus.textContent = err.message;
      otpStatus.style.display = "";
      // [DC Source][FIXED] Выделяем ошибку через danger
      otpStatus.classList.remove('status-info');
      otpStatus.classList.add('status-danger');
    });
  });

  otpInputs.forEach((input, i) => {
    input.addEventListener('input', function (e) {
      let v = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = v;
      if (otpAttempts[i] < maxOtpAttempts) {
        otpAttempts[i]++;
      }
      if (otpAttempts[i] > maxOtpAttempts) {
        e.target.value = '';
        e.target.disabled = true;
        otpStatus.textContent = "Превышено число попыток для позиции " + (i+1);
        otpStatus.style.display = "";
        // [DC Source][FIXED] Выделяем ошибку через danger
        otpStatus.classList.remove('status-info');
        otpStatus.classList.add('status-danger');
        return;
      } else {
        e.target.disabled = false;
      }
      if (v && i < otpInputs.length - 1) {
        otpInputs[i + 1].focus();
      }
      if (otpInputs.every(inp => inp.value.length === 1)) {
        checkOtpCode();
      }
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !e.target.value && i > 0) {
        otpInputs[i - 1].focus();
      }
    });
  });

  function checkOtpCode() {
    const code = otpInputs.map(inp => inp.value).join('');
    fetch('/contact/confirm_sms/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrftoken
      },
      body: `code=${encodeURIComponent(code)}`
    })
    .then(resp => resp.json())
    .then(data => {
      otpStatus.classList.remove('status-danger', 'status-info');
      if (data.ok) {
        otpStatus.textContent = "Номер успешно подтверждён!";
        phoneVerified = true;
        otpConfirmed = true;
        otpStatus.style.display = "";
        // [DC Source][FIXED] Выделяем информационный статус
        otpStatus.classList.add('status-info');
        otpInputs.forEach(inp => inp.disabled = true);
      } else {
        otpStatus.textContent = "Код неверный! Исправьте, осталось по 2 попытки для каждой цифры.";
        otpStatus.style.display = "";
        // [DC Source][FIXED] Выделяем ошибку через danger
        otpStatus.classList.remove('status-info');
        otpStatus.classList.add('status-danger');
        phoneVerified = false;
        otpConfirmed = false;
        let firstEditable = otpInputs.find(inp => !inp.disabled);
        if (firstEditable) firstEditable.focus();
      }
      updateStatusLabels(lastErrors);
      updateSubmitBtn();
    })
    .catch(err => {
      otpStatus.textContent = err.message;
      otpStatus.style.display = "";
      // [DC Source][FIXED] Выделяем ошибку через danger
      otpStatus.classList.remove('status-info');
      otpStatus.classList.add('status-danger');
      phoneVerified = false;
      otpConfirmed = false;
      updateStatusLabels(lastErrors);
      updateSubmitBtn();
    });
  }

  dropdownBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdownList.classList.toggle('open');
  });
  dropdownList.addEventListener('click', function(e){
    if (e.target.tagName === 'LABEL' || e.target.tagName === 'INPUT') {
      setTimeout(() => { updateDropdownSelected(); updateSubmitBtn(); }, 0);
    }
  });
  document.addEventListener('click', function(e){
    if(!messageDropdown.contains(e.target)){
      dropdownList.classList.remove('open');
    }
  });

  function updateDropdownSelected() {
    const checked = Array.from(dropdownList.querySelectorAll('input[type="checkbox"]:checked')).map(cb => {
      const label = dropdownList.querySelector(`label[for="${cb.id}"]`);
      return label ? label.textContent.trim() : cb.value;
    });
    dropdownSelected.innerHTML = '';
    if (checked.length) {
      checked.forEach(text => {
        const lab = document.createElement('div');
        lab.className = 'selected-label';
        lab.textContent = text;
        dropdownSelected.appendChild(lab);
      });
    } else {
      const lab = document.createElement('div');
      lab.className = 'selected-label';
      lab.style.opacity = '0.65';
      lab.textContent = 'Ничего не выбрано :-( А выбрать что-то надо!';
      dropdownSelected.appendChild(lab);
    }
  }

  function setDefaultMessage(pageType) {
    let value = "Общие вопросы";
    if (pageType === "compliance") value = "Комплаенс";
    else if (pageType === "lis") value = "ЛИС";
    else if (pageType === "mis") value = "МИС";
    else if (pageType === "pacs") value = "PACS";
    dropdownList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = (cb.value === value);
    });
    updateDropdownSelected();
    updateStatusLabels(lastErrors);
    updateSubmitBtn();
  }
  setDefaultMessage(window.pageType || "home");

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitBtn.disabled) return;
    const data = new FormData(form);
    const messages = [];
    dropdownList.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => messages.push(cb.value));
    data.delete("message");
    messages.forEach(val => data.append("message", val));
    fetch('/contact/submit/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrftoken
      },
      body: data
    })
    .then(resp => resp.json().then(json => ({status: resp.status, body: json})))
    .then(({status, body}) => {
      if (body.ok) {
        contactFormContent.style.display = "none";
        contactFormSuccess.style.display = "block";
      } else if (body.error) {
        lastErrors = body.error;
        updateStatusLabels(lastErrors);
        updateSubmitBtn();
        alert("Ошибка:\n" + Object.values(body.error).map(arr => arr[0]).join("\n"));
      } else {
        alert("Ошибка: " + (body.error || "Проверьте корректность полей"));
        updateSubmitBtn();
      }
    })
    .catch(err => {
      alert(err.message);
      updateSubmitBtn();
    });
  });

  updateSurnamePlaceholder();
  updateDropdownSelected();
  updateStatusLabels({});
  updateSubmitBtn();
});