import {
  type CustomerCreatedEvent,
  type CustomerUpdatedEvent,
  type EventEntity,
  EventName,
  type SubscriptionCreatedEvent,
  type SubscriptionUpdatedEvent,
  type TransactionCompletedEvent,
} from "@paddle/paddle-node-sdk"

export class ProcessWebhook {
  async processEvent(eventData: EventEntity) {
    console.log(`Processing event: ${eventData.eventType}`)

    try {
      switch (eventData.eventType) {
        case EventName.SubscriptionCreated:
          await this.handleSubscriptionCreated(eventData as SubscriptionCreatedEvent)
          break
        case EventName.SubscriptionUpdated:
          await this.handleSubscriptionUpdated(eventData as SubscriptionUpdatedEvent)
          break
        case EventName.CustomerCreated:
          await this.handleCustomerCreated(eventData as CustomerCreatedEvent)
          break
        case EventName.CustomerUpdated:
          await this.handleCustomerUpdated(eventData as CustomerUpdatedEvent)
          break
        case EventName.TransactionCompleted:
          await this.handleTransactionCompleted(eventData as TransactionCompletedEvent)
          break
        default:
          console.log(`Unhandled event type: ${eventData.eventType}`)
      }

      return { success: true, eventType: eventData.eventType }
    } catch (error) {
      console.error(`Error processing ${eventData.eventType} event:`, error)
      throw error
    }
  }

  private async handleSubscriptionCreated(event: SubscriptionCreatedEvent) {
    console.log(
      "Subscription created:",
      JSON.stringify(
        {
          id: event.data.id,
          status: event.data.status,
          customerId: event.data.customerId,
          items: event.data.items.map((item) => ({
            priceId: item.price?.id,
            productId: item.price?.productId,
          })),
        },
        null,
        2,
      ),
    )

    // In a real application, you would store this data in a database
    // await this.updateSubscriptionData(event)
  }

  private async handleSubscriptionUpdated(event: SubscriptionUpdatedEvent) {
    console.log(
      "Subscription updated:",
      JSON.stringify(
        {
          id: event.data.id,
          status: event.data.status,
          customerId: event.data.customerId,
          scheduledChange: event.data.scheduledChange,
        },
        null,
        2,
      ),
    )

    // In a real application, you would update this data in a database
    // await this.updateSubscriptionData(event)
  }

  private async handleCustomerCreated(event: CustomerCreatedEvent) {
    console.log(
      "Customer created:",
      JSON.stringify(
        {
          id: event.data.id,
          email: event.data.email,
        },
        null,
        2,
      ),
    )

    // In a real application, you would store this data in a database
    // await this.updateCustomerData(event)
  }

  private async handleCustomerUpdated(event: CustomerUpdatedEvent) {
    console.log(
      "Customer updated:",
      JSON.stringify(
        {
          id: event.data.id,
          email: event.data.email,
        },
        null,
        2,
      ),
    )

    // In a real application, you would update this data in a database
    // await this.updateCustomerData(event)
  }

  private async handleTransactionCompleted(event: TransactionCompletedEvent) {
    console.log(
      "Transaction completed:",
      JSON.stringify(
        {
          id: event.data.id,
          customerId: event.data.customerId,
          status: event.data.status,
          amount: event.data.details?.totals?.total,
          currency: event.data.details?.totals?.currency,
        },
        null,
        2,
      ),
    )

    // In a real application, you would store this data in a database
  }

  /* 
  // Uncomment and implement these methods if you're using a database
  
  private async updateSubscriptionData(event: SubscriptionCreatedEvent | SubscriptionUpdatedEvent) {
    // Example database operation:
    // const { error } = await db
    //   .from('subscriptions')
    //   .upsert({
    //     subscription_id: event.data.id,
    //     subscription_status: event.data.status,
    //     price_id: event.data.items[0].price?.id ?? '',
    //     product_id: event.data.items[0].price?.productId ?? '',
    //     scheduled_change: event.data.scheduledChange?.effectiveAt,
    //     customer_id: event.data.customerId,
    //   });
    
    // if (error) throw error;
  }

  private async updateCustomerData(event: CustomerCreatedEvent | CustomerUpdatedEvent) {
    // Example database operation:
    // const { error } = await db
    //   .from('customers')
    //   .upsert({
    //     customer_id: event.data.id,
    //     email: event.data.email,
    //   });
    
    // if (error) throw error;
  }
  */
}
