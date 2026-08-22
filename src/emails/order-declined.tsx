import {
  Html,
  Head,
  Font,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Img,
  Preview,
} from '@react-email/components'

interface OrderDeclinedProps {
  orderNumber: string
  customerName: string
  reason: string
  logoUrl: string
}

export default function OrderDeclined({
  orderNumber,
  customerName,
  reason,
  logoUrl,
}: OrderDeclinedProps) {
  return (
    <Html lang="es">
      <Head>
        <Font
          fontFamily="Krub"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/krub/v9/sZlLdRyC6CRYbkEaDQ.woff2',
            format: 'woff2',
          }}
        />
      </Head>
      <Preview>Tu pedido {orderNumber} no pudo ser procesado</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={logoUrl}
              alt="Punk Medallo"
              width={100}
              height={100}
              style={logo}
            />
          </Section>

          <Section style={card}>
            <Heading style={title}>Pago no procesado</Heading>
            <Text style={subtitle}>
              {customerName}, el pago de tu pedido{' '}
              <strong style={{ color: '#ff4444' }}>{orderNumber}</strong> no
              pudo ser completado ({reason}).
            </Text>

            <Hr style={divider} />

            <Text style={infoLine}>
              Puedes intentar nuevamente desde nuestra tienda. Si el problema
              persiste, contactanos en{' '}
              <a href="mailto:info@punkmedallo.com" style={linkStyle}>
                info@punkmedallo.com
              </a>
              .
            </Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footerText}>
              Punk Medallo Tienda — Radio 24/7
            </Text>
            <Text style={footerLink}>
              <a href="https://punkmedallo.com" style={linkStyle}>
                punkmedallo.com
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: '#181818',
  fontFamily: 'Krub, Arial, Helvetica, sans-serif',
}

const container: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  padding: '40px 16px',
}

const logoSection: React.CSSProperties = {
  margin: '0 auto',
  paddingBottom: 32,
}

const logo: React.CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderRadius: '50%',
  border: '2px solid #a40202',
  objectFit: 'contain',
}

const card: React.CSSProperties = {
  backgroundColor: '#222',
  border: '1px solid rgba(164,2,2,0.3)',
  borderRadius: 12,
  padding: '40px 32px',
}

const title: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: 24,
  color: '#ffffff',
  fontWeight: 700,
  textAlign: 'center',
}

const subtitle: React.CSSProperties = {
  margin: '0 0 24px 0',
  fontSize: 15,
  color: 'rgba(255,255,255,0.6)',
  textAlign: 'center',
  lineHeight: 1.5,
}

const divider: React.CSSProperties = {
  border: 'none',
  height: 1,
  background: 'linear-gradient(to right, transparent, rgba(164,2,2,0.4), transparent)',
  margin: '24px 0',
}

const infoLine: React.CSSProperties = {
  margin: '0 0 4px 0',
  fontSize: 14,
  color: 'rgba(255,255,255,0.7)',
}

const footerSection: React.CSSProperties = {
  textAlign: 'center',
  paddingTop: 24,
}

const footerText: React.CSSProperties = {
  margin: '0 0 4px 0',
  fontSize: 12,
  color: 'rgba(255,255,255,0.25)',
}

const footerLink: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: 'rgba(255,255,255,0.2)',
}

const linkStyle: React.CSSProperties = {
  color: '#ff4444',
  textDecoration: 'none',
}
