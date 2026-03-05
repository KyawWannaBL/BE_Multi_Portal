import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

// Helper function to determine from email
function getFromEmail() {
  const domain = Deno.env.get('RESEND_DOMAIN');
  if (domain) {
    return `send@${domain}`;
  }
  return 'onboarding@resend.dev'; // Default fallback
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { method } = req
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    
    // Extract operation from path
    const operation = pathSegments[0] // send-broadcast, send-notification, send-email, send-sms

    console.log(`Processing ${method} request for operation: ${operation}`)

    // Parse request body
    let requestBody = null
    if (method === 'POST') {
      requestBody = await req.json()
    }

    // Route to appropriate handler
    let result
    switch (operation) {
      case 'send-broadcast':
        result = await sendBroadcastMessage(supabaseClient, requestBody)
        break
      case 'send-notification':
        result = await sendNotification(supabaseClient, requestBody)
        break
      case 'send-email':
        result = await sendEmail(requestBody)
        break
      case 'send-sms':
        result = await sendSMS(requestBody)
        break
      case 'get-templates':
        result = await getNotificationTemplates(supabaseClient)
        break
      case 'create-template':
        result = await createNotificationTemplate(supabaseClient, requestBody)
        break
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in notification function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Send Broadcast Message
async function sendBroadcastMessage(supabaseClient: any, body: any) {
  if (!body || !body.messageId) {
    throw new Error('Message ID is required')
  }

  const { messageId } = body

  // Get the broadcast message
  const { data: message, error: messageError } = await supabaseClient
    .from('broadcast_messages')
    .select('*')
    .eq('id', messageId)
    .single()

  if (messageError) throw messageError
  if (!message) throw new Error('Message not found')

  // Get target recipients based on audience
  let recipients = []
  
  if (message.target_audience === 'all_users') {
    // Get all users (this would need a profiles table)
    const { data: allUsers, error: usersError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name')
    
    if (!usersError && allUsers) {
      recipients = allUsers
    }
  } else if (message.target_audience === 'merchants') {
    // Get all merchants
    const { data: merchants, error: merchantsError } = await supabaseClient
      .from('merchants_be')
      .select('id, email, contact_person as full_name')
      .eq('status', 'active')
    
    if (!merchantsError && merchants) {
      recipients = merchants.filter(m => m.email)
    }
  } else if (message.target_audience === 'deliverymen') {
    // Get all deliverymen
    const { data: deliverymen, error: deliverymenError } = await supabaseClient
      .from('deliverymen_be')
      .select('id, email, full_name')
      .eq('employment_status', 'active')
    
    if (!deliverymenError && deliverymen) {
      recipients = deliverymen.filter(d => d.email)
    }
  }

  console.log(`Found ${recipients.length} recipients for broadcast message`)

  let successCount = 0
  let failureCount = 0
  const deliveryResults = []

  // Send messages based on delivery method
  for (const recipient of recipients) {
    try {
      if (message.delivery_method === 'email' || message.delivery_method === 'all') {
        if (recipient.email) {
          const emailResult = await sendEmail({
            to: recipient.email,
            subject: message.message_title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af;">${message.message_title}</h2>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  ${message.message_content.replace(/\n/g, '<br>')}
                </div>
                <p style="color: #64748b; font-size: 14px;">
                  This message was sent by Britium Express Logistics System.
                </p>
              </div>
            `,
            text: message.message_content
          })
          
          if (emailResult.success) {
            successCount++
            deliveryResults.push({
              recipient_id: recipient.id,
              delivery_method: 'email',
              status: 'sent',
              sent_at: new Date().toISOString()
            })
          } else {
            failureCount++
            deliveryResults.push({
              recipient_id: recipient.id,
              delivery_method: 'email',
              status: 'failed',
              error: emailResult.error,
              sent_at: new Date().toISOString()
            })
          }
        }
      }

      // Add SMS and push notification logic here if needed
      if (message.delivery_method === 'sms' || message.delivery_method === 'all') {
        // SMS implementation would go here
        console.log(`SMS delivery not implemented yet for recipient ${recipient.id}`)
      }

      if (message.delivery_method === 'push' || message.delivery_method === 'all') {
        // Push notification implementation would go here
        console.log(`Push notification delivery not implemented yet for recipient ${recipient.id}`)
      }

    } catch (error) {
      console.error(`Failed to send message to recipient ${recipient.id}:`, error)
      failureCount++
      deliveryResults.push({
        recipient_id: recipient.id,
        delivery_method: message.delivery_method,
        status: 'failed',
        error: error.message,
        sent_at: new Date().toISOString()
      })
    }
  }

  // Update broadcast message with delivery statistics
  const { error: updateError } = await supabaseClient
    .from('broadcast_messages')
    .update({
      status: 'sent',
      sent_time: new Date().toISOString(),
      total_recipients: recipients.length,
      successful_deliveries: successCount,
      failed_deliveries: failureCount
    })
    .eq('id', messageId)

  if (updateError) {
    console.error('Failed to update broadcast message:', updateError)
  }

  return {
    success: true,
    messageId,
    totalRecipients: recipients.length,
    successfulDeliveries: successCount,
    failedDeliveries: failureCount,
    deliveryResults,
    message: 'Broadcast message sent successfully'
  }
}

// Send Individual Notification
async function sendNotification(supabaseClient: any, body: any) {
  if (!body || !body.recipients || !body.subject || !body.content) {
    throw new Error('Recipients, subject, and content are required')
  }

  const { recipients, subject, content, type = 'email' } = body

  let successCount = 0
  let failureCount = 0
  const results = []

  for (const recipient of recipients) {
    try {
      if (type === 'email' && recipient.email) {
        const emailResult = await sendEmail({
          to: recipient.email,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">${subject}</h2>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${content.replace(/\n/g, '<br>')}
              </div>
              <p style="color: #64748b; font-size: 14px;">
                Best regards,<br>
                Britium Express Team
              </p>
            </div>
          `,
          text: content
        })

        if (emailResult.success) {
          successCount++
          results.push({
            recipient: recipient.email,
            status: 'sent',
            messageId: emailResult.message_id
          })
        } else {
          failureCount++
          results.push({
            recipient: recipient.email,
            status: 'failed',
            error: emailResult.error
          })
        }
      }
    } catch (error) {
      console.error(`Failed to send notification to ${recipient.email}:`, error)
      failureCount++
      results.push({
        recipient: recipient.email,
        status: 'failed',
        error: error.message
      })
    }
  }

  return {
    success: true,
    totalRecipients: recipients.length,
    successfulDeliveries: successCount,
    failedDeliveries: failureCount,
    results,
    message: 'Notifications sent successfully'
  }
}

// Send Email using Resend API
async function sendEmail(emailData: any) {
  const { to, subject, html, text } = emailData

  if (!to || !subject || (!html && !text)) {
    throw new Error('Email recipient, subject, and content are required')
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: to,
        subject: subject,
        html: html,
        text: text || html?.replace(/<[^>]*>/g, '') // Strip HTML for text version
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Resend API error: ${response.status} ${response.statusText} - ${errorData}`)
    }

    const result = await response.json()
    return { 
      success: true, 
      message_id: result.id,
      message: 'Email sent successfully'
    }

  } catch (error) {
    console.error('Email sending failed:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

// Send SMS (placeholder implementation)
async function sendSMS(smsData: any) {
  const { to, message } = smsData

  if (!to || !message) {
    throw new Error('Phone number and message are required')
  }

  // This is a placeholder implementation
  // In a real implementation, you would integrate with an SMS provider like Twilio
  console.log(`SMS would be sent to ${to}: ${message}`)

  return {
    success: true,
    message: 'SMS functionality not implemented yet',
    to,
    content: message
  }
}

// Get Notification Templates
async function getNotificationTemplates(supabaseClient: any) {
  // This would fetch from a notification_templates table
  // For now, return some default templates
  const templates = [
    {
      id: 'delivery_confirmation',
      name: 'Delivery Confirmation',
      subject: 'Your package has been delivered - {{tracking_number}}',
      content: 'Dear {{customer_name}},\n\nYour package with tracking number {{tracking_number}} has been successfully delivered to {{delivery_address}}.\n\nDelivery Date: {{delivery_date}}\nDelivered by: {{rider_name}}\n\nThank you for choosing Britium Express!',
      variables: ['customer_name', 'tracking_number', 'delivery_address', 'delivery_date', 'rider_name']
    },
    {
      id: 'pickup_scheduled',
      name: 'Pickup Scheduled',
      subject: 'Pickup scheduled for {{pickup_date}} - {{tracking_number}}',
      content: 'Dear {{customer_name}},\n\nYour pickup has been scheduled for {{pickup_date}} at {{pickup_address}}.\n\nTracking Number: {{tracking_number}}\nEstimated Pickup Time: {{pickup_time}}\n\nPlease ensure someone is available at the pickup location.',
      variables: ['customer_name', 'tracking_number', 'pickup_address', 'pickup_date', 'pickup_time']
    },
    {
      id: 'delivery_failed',
      name: 'Delivery Failed',
      subject: 'Delivery attempt failed - {{tracking_number}}',
      content: 'Dear {{customer_name}},\n\nWe attempted to deliver your package ({{tracking_number}}) but were unable to complete the delivery.\n\nReason: {{failure_reason}}\nNext Attempt: {{next_attempt_date}}\n\nPlease contact us if you need to reschedule.',
      variables: ['customer_name', 'tracking_number', 'failure_reason', 'next_attempt_date']
    }
  ]

  return {
    success: true,
    templates,
    message: 'Notification templates retrieved successfully'
  }
}

// Create Notification Template
async function createNotificationTemplate(supabaseClient: any, body: any) {
  if (!body || !body.name || !body.subject || !body.content) {
    throw new Error('Template name, subject, and content are required')
  }

  // This would save to a notification_templates table
  // For now, just return success
  const template = {
    id: `custom_${Date.now()}`,
    ...body,
    created_at: new Date().toISOString()
  }

  return {
    success: true,
    template,
    message: 'Notification template created successfully'
  }
}