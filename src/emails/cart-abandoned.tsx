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

interface CartAbandonedProps {
  orderNumber: string
  customerName: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  siteUrl: string
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function CartAbandoned({
  orderNumber,
  customerName,
  items,
  total,
  siteUrl,
}: CartAbandonedProps) {
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
      <Preview>¿Olvidaste tu compra? {orderNumber}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src="https://punkmedallo.com/logo_punk_medallo.jpg"
              alt="Punk Medallo"
              width={100}
              height={100}
              style={logo}
            />
          </Section>

          <Section style={card}>
            <Heading style={title}>¿Olvidaste tu compra?</Heading>
            <Text style={subtitle}>
              {customerName}, tenés un pedido pendiente en{' '}
              <strong style={{ color: '#dc2626' }}>Punk Medallo</strong>.
            </Text>

            <Hr style={divider} />

            <Text style={sectionLabel}>Productos</Text>
            {items.map((item, i) => (
              <div key={i} style={itemRow}>
                <Text style={itemName}>
                  {item.name}{' '}
                  <span style={itemQty}>x{item.quantity}</span>
                </Text>
                <Text style={itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
              </div>
            ))}

            <Hr style={divider} />

            <div style={totalRow}>
              <Text style={totalLabel}>Total</Text>
              <Text style={totalValue}>{formatPrice(total)}</Text>
            </div>

            <Text style={orderRef}>Pedido: {orderNumber}</Text>

            <a href={siteUrl} style={cta}>
              Volver a la tienda
            </a>

            <Text style={infoLine}>
              Podés retomar tu compra en cualquier momento. Este pedido
              será cancelado automáticamente si no se completa.
            </Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footerText}>Punk Medallo Tienda — Radio 24/7</Text>
            <Text style={footerLink}>
              <a href="https://punkmedallo.com" style={linkStyle}>
                punkmedallo.com
              </a>
              {' · '}
              <a href="mailto:info@punkmedallo.com" style={linkStyle}>
                info@punkmedallo.com
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

const sectionLabel: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: 13,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
}

const itemRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
}

const itemName: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: 'rgba(255,255,255,0.85)',
}

const itemQty: React.CSSProperties = {
  color: 'rgba(255,255,255,0.4)',
  fontSize: 13,
}

const itemPrice: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: '#dc2626',
  fontWeight: 600,
}

const totalRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const totalLabel: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: '#ffffff',
}

const totalValue: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: '#dc2626',
}

const orderRef: React.CSSProperties = {
  margin: '16px 0 24px 0',
  fontSize: 12,
  color: 'rgba(255,255,255,0.3)',
  textAlign: 'center' as const,
}

const cta: React.CSSProperties = {
  display: 'block',
  textAlign: 'center' as const,
  padding: '14px 32px',
  backgroundColor: '#dc2626',
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 700,
  borderRadius: 8,
  textDecoration: 'none',
  marginBottom: 16,
}

const infoLine: React.CSSProperties = {
  margin: '16px 0 0 0',
  fontSize: 13,
  color: 'rgba(255,255,255,0.4)',
  textAlign: 'center' as const,
  lineHeight: 1.5,
}

const footerSection: React.CSSProperties = {
  textAlign: 'center' as const,
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
