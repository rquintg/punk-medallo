import {
  Body,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface BoletaEmailItem {
  codigo: string
  qrDataUrl: string
  tipoNombre: string
}

interface TicketProps {
  orderNumber: string
  customerName: string
  eventoTitulo: string
  eventoFecha: string
  eventoLugar: string
  boletas: BoletaEmailItem[]
  logoUrl: string
  orderUrl: string
}

const body: React.CSSProperties = {
  backgroundColor: '#181818',
  fontFamily: "'Krub', Arial, Helvetica, sans-serif",
  margin: 0,
  padding: '40px 16px',
}

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  borderRadius: '12px',
  overflow: 'hidden',
}

const card: React.CSSProperties = {
  backgroundColor: '#222222',
  border: '1px solid rgba(164,2,2,0.3)',
  borderRadius: '12px',
  padding: '32px 28px',
}

const title: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#ffffff',
  textAlign: 'center',
  margin: '0 0 6px',
}

const subtitle: React.CSSProperties = {
  fontSize: '14px',
  color: 'rgba(255,255,255,0.6)',
  textAlign: 'center',
  lineHeight: 1.6,
  margin: '0 0 24px',
}

const eventoBox: React.CSSProperties = {
  backgroundColor: '#181818',
  borderLeft: '3px solid #dc2626',
  borderRadius: '6px',
  padding: '12px 16px',
  marginBottom: '24px',
}

const eventoLabel: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#ff4444',
  margin: '0 0 4px',
}

const eventoTexto: React.CSSProperties = {
  fontSize: '14px',
  color: '#ffffff',
  margin: 0,
}

const boletaCard: React.CSSProperties = {
  backgroundColor: '#181818',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  padding: '20px',
  textAlign: 'center' as const,
  marginBottom: '18px',
}

const qrImg: React.CSSProperties = {
  width: '160px',
  height: '160px',
  margin: '0 auto 12px',
  border: '6px solid #ffffff',
  borderRadius: '8px',
}

const codigoStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  letterSpacing: '4px',
  color: '#ff4444',
  margin: '8px 0 4px',
}

const tipoStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(255,255,255,0.7)',
  margin: 0,
}

const titularStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(255,255,255,0.45)',
  margin: '6px 0 0',
}

const nota: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(255,255,255,0.35)',
  textAlign: 'center' as const,
  lineHeight: 1.6,
  margin: '0 0 24px',
}

const button: React.CSSProperties = {
  display: 'inline-block',
  padding: '12px 36px',
  fontSize: '14px',
  fontWeight: 700,
  color: '#ffffff',
  textDecoration: 'none',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  backgroundColor: '#a40202',
  borderRadius: '8px',
}

export default function Ticket({
  orderNumber,
  customerName,
  eventoTitulo,
  eventoFecha,
  eventoLugar,
  boletas,
  logoUrl,
  orderUrl,
}: TicketProps) {
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
      <Preview>Tus boletas para {eventoTitulo} — {orderNumber}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={{ textAlign: 'center', paddingBottom: '24px' }}>
            <Img src={logoUrl} alt="Punk Medallo" width={100} height={100}
              style={{ borderRadius: '50%', border: '2px solid #a40202', display: 'block', margin: '0 auto' }} />
          </Section>

          <div style={card}>
            <Text style={title}>Tus boletas están listas</Text>
            <Text style={subtitle}>
              {customerName}, guarda este correo — cada QR se escanea una sola vez en la puerta.
            </Text>

            {/* Evento */}
            <div style={eventoBox}>
              <p style={eventoLabel}>{orderNumber}</p>
              <p style={{ ...eventoTexto, fontWeight: 700 }}>{eventoTitulo}</p>
              <p style={{ ...eventoTexto, color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                {eventoFecha} · {eventoLugar}
              </p>
            </div>

            {/* Boletas con QR */}
            {boletas.map((b) => (
              <div key={b.codigo} style={boletaCard}>
                <Img src={b.qrDataUrl} alt={`QR ${b.codigo}`} style={qrImg} />
                <p style={{ ...eventoLabel, marginBottom: 0 }}>{b.tipoNombre}</p>
                <p style={codigoStyle}>{b.codigo}</p>
                <p style={titularStyle}>A nombre de {customerName}</p>
              </div>
            ))}

            <Text style={nota}>
              Presenta el QR en la puerta junto con tu documento de identidad.
              La boleta es personal e intransferible una vez escaneada.
            </Text>

            <Section style={{ textAlign: 'center', marginBottom: '8px' }}>
              <a href={orderUrl} style={button}>Ver mis pedidos</a>
            </Section>
          </div>

          <Text style={{
            fontSize: '12px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '24px',
          }}>
            Punk Medallo Tienda — Radio 24/7
          </Text>
          <Hr style={{ borderColor: 'rgba(164,2,2,0.3)', marginTop: '12px' }} />
          <Text style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
            Si los botones no funcionan, copia y pega este enlace en tu navegador:
            <br />{orderUrl}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
