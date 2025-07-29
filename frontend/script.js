let authToken = null;

// ✅ Section dikhane ka function
function showSection(id) {
  document.querySelectorAll('main section').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

// ✅ Login ka function
function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  fetch('http://localhost:3000/login', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Login response:", data);

    if (data.success) {
      authToken = data.token;
      console.log("Token mil gaya:", authToken);
      showSection('certificateEntry');
    } else {
      alert("Access Denied");
    }
  })
  .catch(err => {
    alert("Login error");
    console.error("Login error:", err);
  });
}

// ✅ Certificate Save karne ka function
function saveCertificate() {
  if (!authToken) {
    alert("Unauthorized. Please login first.");
    return;
  }

  const data = {
    enroll: document.getElementById('enroll').value.trim(),
    issued: document.getElementById('issued').value.trim(),
    name: document.getElementById('name').value.trim(),
    father: document.getElementById('fatherName').value.trim(),
    course: document.getElementById('course').value.trim(),
    joining: document.getElementById('joining').value.trim(),
    grade: document.getElementById('grade').value.trim(),
    address: document.getElementById('address').value.trim()
  };

  console.log("Sending certificate data:", data);

  fetch('http://localhost:3000/submit', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + authToken
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(result => {
    console.log("Submit response:", result);

    if (result.success) {
      alert("Certificate saved successfully!");
      clearCertificateForm(); // ✅ Form clear karo
    } else {
      alert("Error: " + result.message);
    }
  })
  .catch(error => {
    alert("Fetch error");
    console.error("Fetch error:", error);
  });
}

// ✅ Form reset karne ka helper function
function clearCertificateForm() {
  document.getElementById('enroll').value = '';
  document.getElementById('issued').value = '';
  document.getElementById('name').value = '';
  document.getElementById('fatherName').value = '';
  document.getElementById('course').value = '';
  document.getElementById('joining').value = '';
  document.getElementById('grade').value = '';
  document.getElementById('address').value = '';
}

// ✅ Certificate verify karne ka function
function verifyCertificate() {
  const enroll = document.getElementById('certId').value.trim();
  const resultDiv = document.getElementById('certResult');

  if (!enroll) {
    alert("Please enter an enrollment number");
    return;
  }

  console.log("Verifying certificate for:", enroll);

  fetch('http://localhost:3000/verify', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enroll })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Verification response:", data);

    if (data.success && data.certificate) {
      const cert = data.certificate;
      resultDiv.innerHTML = `
        <p><strong>Enroll:</strong> ${cert.enroll}</p>
        <p><strong>Issued Date:</strong> ${cert.issued}</p>
        <p><strong>Name:</strong> ${cert.name}</p>
        <p><strong>Father Name:</strong> ${cert.fatherName}</p>
        <p><strong>Course:</strong> ${cert.course}</p>
        <p><strong>Joining Date:</strong> ${cert.joining}</p>
        <p><strong>Grade:</strong> ${cert.grade}</p>
        <p><strong>Address:</strong> ${cert.address}</p>
      `;
    } else {
      resultDiv.innerHTML = `<p style="color:red">Certificate not found.</p>`;
    }
  })
  .catch(err => {
    console.error("Verification error:", err);
    alert("Verification failed");
  });
}
