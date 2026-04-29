import QRCode from 'qrcode'


//Fungsi membuat QR Code
export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text)
  } catch (err) {
    console.error('Gagal generate QR Code:', err)
    return ''
  }
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'long'
  }).format(date)
}