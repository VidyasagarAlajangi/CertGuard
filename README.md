# CertGuard 🛡️🎓

**CertGuard** is a secure, blockchain-based certificate verification and management platform. It helps educational institutions issue tamper-proof certificates, allows organizations to verify credentials instantly, and enables students to store and share their achievements safely.

---

## 🚀 Features

### 🎓 For Students

- **Digital Certificate Wallet**: Store all verified certificates in one secure place.
- **Instant Sharing**: Share certificates with employers via link or QR code.
- **Tamper-Proof Records**: Certificates are stored on blockchain to ensure authenticity.

### 🏫 For Institutions

- **Certificate Issuance**: Upload and issue blockchain-based certificates.
- **Dashboard**: View issued, revoked, or pending certificates.
- **Bulk Upload**: Issue certificates in bulk from CSV or database.

### 🏢 For Employers/Verifiers

- **One-Click Verification**: Instantly verify the authenticity of a certificate.
- **Detailed Logs**: View issue date, issuer info, and blockchain proof.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Blockchain**: Ethereum (Gnosis Test chain network)
- **Database**: MongoDB
- **Authentication**: JWT

---

## 📂 Folder Structure

```
certguard/
│
├── frontend/             # React frontend
│   ├── src/components/
│   ├── src/pages/
│   └── ...
│
├── backend/             # Node.js backend
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   │── BlockChain/
│   └──...
│
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/VidyaSagarAlajangi/certguard.git
cd certguard
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
npm run dev
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
npm start
```


---

## 🔐 Environment Variables

Create a `.env` file in `/server` with:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
WEB3_PROVIDER=https://rpc-url
CONTRACT_ADDRESS=deployed_contract_address
S3 = aws_s3_address
S3_bucket_name = Bucket_name
```

---

## 📈 Future Enhancements

- IPFS storage for full document storage
- Integration with LinkedIn certificate badges
- QR code with verification metadata
- Mobile application development

---

## 🤝 Contributing

1. Fork the repo 🍴
2. Create a branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to GitHub (`git push origin feature-name`)
5. Create a Pull Request ✅

---


## 💡 Inspiration

**CertGuard** was inspired by the need for trusted, verifiable credentials in a digital-first world. It empowers students and institutions to combat fraud and streamline verification in academia and the workforce.

---

## 🌐 [Live Demo](https://certguard-1.onrender.com/)
---

## 📢 Contact

- **Developer**: [Vidya Sagar Alajangi](https://github.com/VidyasagarAlajangi/)
- **Email**: [vidyasagaralajangi@gmail.com](mailto\:vidyasagaralajangi@gmail.com)]
- **LinkedIn**: ([Profile](https://www.linkedin.com/in/alajangi-vidyasagar/))

---

