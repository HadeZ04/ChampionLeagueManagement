/**
 * Email Service
 * Handles sending emails for team invitations and other notifications
 * 
 * Note: Currently logs emails to console. In production, integrate with:
 * - SMTP server (nodemailer)
 * - Email service (SendGrid, AWS SES, etc.)
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface TeamInvitationEmailData {
  teamName: string;
  seasonName: string;
  responseDeadline: string;
  invitationId: number;
  regulations: {
    participationFee: number; // in VND
    minPlayers: number;
    maxPlayers: number;
    maxForeignPlayersRegistration: number;
    maxForeignPlayersMatch: number;
    minPlayerAge: number;
    minStadiumCapacity: number;
    minStadiumRating: number;
    governingBodyRequired: string;
  };
  contactEmail?: string;
  contactPhone?: string;
}

/**
 * Send email (currently logs to console)
 * In production, replace with actual email sending implementation
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // TODO: Replace with actual email sending implementation
  // Example with nodemailer:
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: parseInt(process.env.SMTP_PORT || '587'),
  //   secure: false,
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS,
  //   },
  // });
  // await transporter.sendMail(options);

  // For now, log email details
  console.log('\n📧 ===== EMAIL SENT =====');
  console.log(`To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log('Body (HTML):');
  console.log(options.html);
  if (options.text) {
    console.log('Body (Text):');
    console.log(options.text);
  }
  if (options.attachments) {
    console.log(`Attachments: ${options.attachments.map(a => a.filename).join(', ')}`);
  }
  console.log('=========================\n');
}

/**
 * Generate HTML email template for team invitation
 */
export function generateInvitationEmailTemplate(data: TeamInvitationEmailData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lời Mời Tham Gia Giải Hạng Nhất Vô Địch Bóng Đá Quốc Gia</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #1e88e5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1e88e5;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .team-name {
      font-size: 20px;
      font-weight: bold;
      color: #1976d2;
      margin: 20px 0;
    }
    .deadline {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .deadline strong {
      color: #856404;
    }
    .regulations {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 20px;
      margin: 20px 0;
    }
    .regulations h2 {
      color: #495057;
      margin-top: 0;
      font-size: 18px;
      border-bottom: 2px solid #dee2e6;
      padding-bottom: 10px;
    }
    .regulation-item {
      margin: 12px 0;
      padding-left: 20px;
      position: relative;
    }
    .regulation-item::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #1e88e5;
      font-weight: bold;
    }
    .regulation-label {
      font-weight: 600;
      color: #495057;
    }
    .regulation-value {
      color: #6c757d;
    }
    .action-button {
      display: inline-block;
      background-color: #1e88e5;
      color: #ffffff;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
      font-size: 12px;
      color: #6c757d;
      text-align: center;
    }
    .contact-info {
      margin-top: 20px;
      padding: 15px;
      background-color: #e3f2fd;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Lời Mời Tham Gia Giải Hạng Nhất Vô Địch Bóng Đá Quốc Gia</h1>
    </div>

    <div class="content">
      <p>Kính gửi Ban lãnh đạo đội bóng <span class="team-name">${data.teamName}</span>,</p>

      <p>Ban Tổ chức giải hạng nhất vô địch bóng đá quốc gia trân trọng kính mời đội bóng của Quý vị tham gia mùa giải <strong>${data.seasonName}</strong>.</p>

      <div class="deadline">
        <strong>⚠️ Thời hạn phản hồi:</strong> Quý đội vui lòng xác nhận tham gia <strong>chậm nhất vào ngày ${formatDate(data.responseDeadline)}</strong>.
      </div>

      <div class="regulations">
        <h2>📋 Các Quy Định Và Yêu Cầu Tham Gia Giải</h2>

        <div class="regulation-item">
          <span class="regulation-label">Lệ phí tham gia:</span>
          <span class="regulation-value"> ${formatCurrency(data.regulations.participationFee)}</span>
        </div>

        <div class="regulation-item">
          <span class="regulation-label">Cơ quan chủ quản:</span>
          <span class="regulation-value"> ${data.regulations.governingBodyRequired}</span>
        </div>

        <div class="regulation-item">
          <span class="regulation-label">Số lượng cầu thủ:</span>
          <span class="regulation-value"> Tối thiểu ${data.regulations.minPlayers} cầu thủ, tối đa ${data.regulations.maxPlayers} cầu thủ</span>
        </div>

        <div class="regulation-item">
          <span class="regulation-label">Cầu thủ nước ngoài:</span>
          <span class="regulation-value"> Tối đa ${data.regulations.maxForeignPlayersRegistration} cầu thủ khi đăng ký, tối đa ${data.regulations.maxForeignPlayersMatch} cầu thủ khi thi đấu trên sân</span>
        </div>

        <div class="regulation-item">
          <span class="regulation-label">Độ tuổi cầu thủ:</span>
          <span class="regulation-value"> Tối thiểu ${data.regulations.minPlayerAge} tuổi</span>
        </div>

        <div class="regulation-item">
          <span class="regulation-label">Sân nhà:</span>
          <span class="regulation-value"> 
            Sức chứa tối thiểu ${data.regulations.minStadiumCapacity.toLocaleString('vi-VN')} chỗ ngồi, 
            đạt tiêu chuẩn ít nhất ${data.regulations.minStadiumRating} sao của Liên đoàn Bóng đá Thế giới (FIFA), 
            sân bóng nằm tại Việt Nam
          </span>
        </div>

        <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
          <em>Vui lòng đảm bảo đội bóng đáp ứng đầy đủ các yêu cầu trên trước khi xác nhận tham gia.</em>
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="#" class="action-button">📝 Phản Hồi Lời Mời</a>
      </div>

      ${data.contactEmail || data.contactPhone ? `
      <div class="contact-info">
        <strong>📞 Thông Tin Liên Hệ:</strong><br>
        ${data.contactEmail ? `Email: ${data.contactEmail}<br>` : ''}
        ${data.contactPhone ? `Điện thoại: ${data.contactPhone}` : ''}
      </div>
      ` : ''}

      <p>Trân trọng,<br>
      <strong>Ban Tổ chức Giải Hạng Nhất Vô Địch Bóng Đá Quốc Gia</strong></p>
    </div>

    <div class="footer">
      <p>Email này được gửi tự động từ hệ thống quản lý giải đấu.</p>
      <p>Mã lời mời: #${data.invitationId}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of invitation email
 */
export function generateInvitationEmailText(data: TeamInvitationEmailData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return `
LỜI MỜI THAM GIA GIẢI HẠNG NHẤT VÔ ĐỊCH BÓNG ĐÁ QUỐC GIA
==========================================================

Kính gửi Ban lãnh đạo đội bóng ${data.teamName},

Ban Tổ chức giải hạng nhất vô địch bóng đá quốc gia trân trọng kính mời đội bóng của Quý vị tham gia mùa giải ${data.seasonName}.

THỜI HẠN PHẢN HỒI: Chậm nhất vào ngày ${formatDate(data.responseDeadline)}

CÁC QUY ĐỊNH VÀ YÊU CẦU THAM GIA:

1. Lệ phí tham gia: ${formatCurrency(data.regulations.participationFee)}

2. Cơ quan chủ quản: ${data.regulations.governingBodyRequired}

3. Số lượng cầu thủ: Tối thiểu ${data.regulations.minPlayers} cầu thủ, tối đa ${data.regulations.maxPlayers} cầu thủ

4. Cầu thủ nước ngoài: Tối đa ${data.regulations.maxForeignPlayersRegistration} cầu thủ khi đăng ký, tối đa ${data.regulations.maxForeignPlayersMatch} cầu thủ khi thi đấu trên sân

5. Độ tuổi cầu thủ: Tối thiểu ${data.regulations.minPlayerAge} tuổi

6. Sân nhà: Sức chứa tối thiểu ${data.regulations.minStadiumCapacity.toLocaleString('vi-VN')} chỗ ngồi, đạt tiêu chuẩn ít nhất ${data.regulations.minStadiumRating} sao FIFA, sân bóng nằm tại Việt Nam

Vui lòng đảm bảo đội bóng đáp ứng đầy đủ các yêu cầu trên trước khi xác nhận tham gia.

${data.contactEmail || data.contactPhone ? `THÔNG TIN LIÊN HỆ:\n${data.contactEmail ? `Email: ${data.contactEmail}\n` : ''}${data.contactPhone ? `Điện thoại: ${data.contactPhone}` : ''}` : ''}

Trân trọng,
Ban Tổ chức Giải Hạng Nhất Vô Địch Bóng Đá Quốc Gia

---
Email này được gửi tự động từ hệ thống quản lý giải đấu.
Mã lời mời: #${data.invitationId}
  `.trim();
}

/**
 * Send team invitation email
 */
export async function sendTeamInvitationEmail(
  toEmail: string | string[],
  data: TeamInvitationEmailData
): Promise<void> {
  const html = generateInvitationEmailTemplate(data);
  const text = generateInvitationEmailText(data);

  await sendEmail({
    to: toEmail,
    subject: `Lời Mời Tham Gia Giải Hạng Nhất Vô Địch Bóng Đá Quốc Gia - ${data.seasonName}`,
    html,
    text,
  });
}

