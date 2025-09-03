import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Copy, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
  babySlug: string;
  babyName: string;
}

const QRCodeGenerator = ({ babySlug, babyName }: QRCodeGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const donationUrl = `${window.location.origin}/doar/${babySlug}`;

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrCode = await QRCode.toDataURL(donationUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeUrl(qrCode);
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        toast.error('Erro ao gerar QR Code');
      } finally {
        setLoading(false);
      }
    };

    generateQRCode();
  }, [donationUrl]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(donationUrl);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `qr-code-doacao-${babySlug}.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code baixado!');
  };

  return (
    <Card className="card-baby">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code para Doações
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground text-sm">
          Compartilhe este QR Code para que outras pessoas possam doar facilmente para {babyName}
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg shadow-md">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code para Doações"
                  className="w-64 h-64"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Link de Doação:</p>
              <div className="p-2 bg-background/50 rounded text-xs break-all text-muted-foreground">
                {donationUrl}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                onClick={handleCopyUrl}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar Link
              </Button>
              <Button
                onClick={handleDownloadQR}
                className="gap-2 btn-baby-mint"
              >
                <Download className="w-4 h-4" />
                Baixar QR Code
              </Button>
            </div>

            <div className="bg-baby-blue/10 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Dica:</strong> Imprima este QR Code e coloque em locais visíveis, 
                ou compartilhe digitalmente nas redes sociais para facilitar as doações!
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;