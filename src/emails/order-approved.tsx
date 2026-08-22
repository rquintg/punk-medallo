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

interface OrderApprovedProps {
  orderNumber: string
  customerName: string
  orderUrl: string
  trackingUrl: string
  logoUrl: string
}

export default function OrderApproved({
  orderNumber,
  customerName,
  orderUrl,
  trackingUrl,
  logoUrl,
}: OrderApprovedProps) {
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
      <Preview>Tu pedido {orderNumber} fue aprobado</Preview>
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
            <Heading style={title}>¡Pago aprobado!</Heading>
            <Text style={subtitle}>
              {customerName}, el pago de tu pedido{' '}
              <strong style={{ color: '#ff4444' }}>{orderNumber}</strong> fue
              aprobado exitosamente. Ya estamos preparando todo para enviártelo.
            </Text>

            <Hr style={divider} />

            <Section style={ctaSection}>
              <Text style={ctaText}>
                ¿Quieres hacerle seguimiento a tu pedido? Podrás ver el estado
                en tiempo real desde el inicio hasta la entrega.
              </Text>
              <a href={orderUrl} style={button}>
                Seguir mi pedido
              </a>
              <Text style={trackingHint}>
                ¿No llegaste al link? También puedes rastrearlo sin cuenta en{' '}
                <a href={trackingUrl} style={linkStyle}>
                  /tienda/rastrear
                </a>
              </Text>
            </Section>

            <Text style={infoLine}>
              Te enviaremos un correo cuando el pedido sea despachado.
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

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '0 0 24px 0',
}

const ctaText: React.CSSProperties = {
  margin: '0 0 16px 0',
  fontSize: 14,
  color: 'rgba(255,255,255,0.7)',
  lineHeight: 1.5,
}

const button: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#dc2626',
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 700,
  textDecoration: 'none',
}

const trackingHint: React.CSSProperties = {
  margin: '12px 0 0 0',
  fontSize: 12,
  color: 'rgba(255,255,255,0.4)',
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
