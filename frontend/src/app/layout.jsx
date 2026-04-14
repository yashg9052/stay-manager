import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Stay Manager',
  description: 'Flat, room, bed and tenant management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 20px 60px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}