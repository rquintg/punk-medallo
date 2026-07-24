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

interface OrderItemProps {
  name: string
  quantity: number
  price: number
  size: string | null
  color: string | null
  imageUrl: string | null
}

interface OrderConfirmationProps {
  orderNumber: string
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  items: OrderItemProps[]
  total: number
  estimatedDelivery: string
}

function formatPrice(amount: number): string {
  return `$${amount.toLocaleString('es-CO')}`
}

export default function OrderConfirmation({
  orderNumber,
  customerName,
  email,
  phone,
  address,
  city,
  items,
  total,
  estimatedDelivery,
}: OrderConfirmationProps) {
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
      <Preview>Gracias por tu compra — {orderNumber}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://punkmedallo.com/logo_punk_medallo.jpg"
              alt="Punk Medallo"
              width={100}
              height={100}
              style={logo}
            />
          </Section>

          {/* Card */}
          <Section style={card}>
            <Heading style={title}>¡Gracias por tu compra!</Heading>
            <Text style={subtitle}>
              {customerName}, recibimos tu pedido y ya estamos preparándolo.
            </Text>

            <Hr style={divider} />

            {/* Order number */}
            <Section style={row}>
              <Text style={label}>Pedido</Text>
              <Text style={value}>{orderNumber}</Text>
            </Section>
            <Section style={row}>
              <Text style={label}>Entrega estimada</Text>
              <Text style={value}>{estimatedDelivery}</Text>
            </Section>

            <Hr style={divider} />

            {/* Items */}
            <Heading as="h3" style={sectionTitle}>Artículos</Heading>
            {items.map((item, i) => (
              <Section key={i} style={itemRow}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tr>
                    <td style={{ width: 48, verticalAlign: 'top', paddingRight: 12 }}>
                      {item.imageUrl ? (
                        <Img
                          src={item.imageUrl}
                          alt={item.name}
                          width={48}
                          height={48}
                          style={{ display: 'block', borderRadius: 4, objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: 48, height: 48, backgroundColor: '#333', borderRadius: 4 }} />
                      )}
                    </td>
                    <td style={{ verticalAlign: 'top' }}>
                      <Text style={itemName}>
                        {item.name}
                        {item.quantity > 1 && ` (x${item.quantity})`}
                      </Text>
                      <Text style={itemMeta}>
                        {[item.size, item.color].filter(Boolean).join(' — ')}
                      </Text>
                    </td>
                    <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                      <Text style={itemPrice}>
                        {formatPrice(item.price * item.quantity)}
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>
            ))}

            <Hr style={divider} />

            {/* Total */}
            <Section style={totalRow}>
              <Text style={totalLabel}>Total</Text>
              <Text style={totalValue}>{formatPrice(total)}</Text>
            </Section>

            <Hr style={divider} />

            {/* Shipping */}
            <Heading as="h3" style={sectionTitle}>Datos de envío</Heading>
            <Text style={infoLine}>{address}</Text>
            <Text style={infoLine}>{city}</Text>
            <Text style={infoLine}>{email}</Text>
            <Text style={infoLine}>{phone}</Text>
          </Section>

          {/* Footer */}
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

const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 8,
}

const label: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: 'rgba(255,255,255,0.5)',
}

const value: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#ffffff',
  fontWeight: 700,
}

const sectionTitle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: 14,
  color: '#ff4444',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.5,
}

const itemRow: React.CSSProperties = {
  marginBottom: 12,
}

const itemName: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: '#ffffff',
  fontWeight: 600,
}

const itemMeta: React.CSSProperties = {
  margin: '2px 0 0 0',
  fontSize: 12,
  color: 'rgba(255,255,255,0.4)',
}

const itemPrice: React.CSSProperties = {
  margin: '4px 0 0 0',
  fontSize: 14,
  color: '#ff4444',
  fontWeight: 700,
}

const totalRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const totalLabel: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  color: '#ffffff',
  fontWeight: 700,
}

const totalValue: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  color: '#ff4444',
  fontWeight: 700,
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
