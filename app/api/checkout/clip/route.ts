import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { amount, items, metadata } = body

        // Validate Clip API Configuration
        const clipKey = process.env.CLIP_API_KEY?.trim()
        const clipSecret = process.env.CLIP_SECRET_KEY?.trim()
        const clipBaseUrl = process.env.CLIP_BASE_URL?.trim() || 'https://api.payclip.com/v2'

        if (!clipKey || clipKey.includes('your-clip-api-key')) {
            console.warn('Clip API key is missing. Returning mock reference.')

            // Mock response for development
            return NextResponse.json({
                status: 'success',
                payment_url: `https://payclip.com/checkout/mock-${Math.random().toString(36).substr(2, 9)}`,
                reference: `CLIP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                is_mock: true
            })
        }

        console.log(`Calling Clip API: ${clipBaseUrl}/checkout`)
        // Call Clip API
        const response = await fetch(`${clipBaseUrl}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': clipSecret
                    ? `Basic ${Buffer.from(clipKey + ':' + clipSecret).toString('base64')}`
                    : `Basic ${Buffer.from(clipKey + ':').toString('base64')}`
            },
            body: JSON.stringify({
                amount: Math.round(Number(amount) * 100) / 100,
                currency: 'MXN',
                purchase_description: `Compra en Caps Store - ${items.length} productos`,
                redirection_url: {
                    success_url: `${process.env.NEXTAUTH_URL}/checkout/success`,
                    cancel_url: `${process.env.NEXTAUTH_URL}/checkout`
                },
                metadata: {
                    ...metadata,
                    source: 'CapsStore_Web',
                    items_summary: items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ').substring(0, 100)
                }
            })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Clip API Response Error Data:', JSON.stringify(data, null, 2))
            console.error('Clip API Status:', response.status)
            throw new Error(data.message || `Error de Clip (${response.status}): ${JSON.stringify(data)}`)
        }

        console.log('Clip API Success Response:', JSON.stringify(data, null, 2))

        const finalUrl = data.payment_request_url || data.payment_url || data.url || data.link_url || data.payment_link_url

        if (!finalUrl) {
            console.error('Error: No se encontró la URL de pago en la respuesta de Clip')
            throw new Error('No se pudo generar la URL de pago (falta campo en respuesta)')
        }

        return NextResponse.json({
            status: 'success',
            payment_url: finalUrl,
            reference: data.checkout_id || 'N/A'
        })

    } catch (error: any) {
        console.error('Clip API Error:', error)
        return NextResponse.json(
            { status: 'error', message: error.message || 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
