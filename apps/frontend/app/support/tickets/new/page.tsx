import { CreateTicketForm } from '@/components/support/CreateTicketForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function NewSupportTicketPage() {
  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Support Ticket</CardTitle>
          <CardDescription>Share all relevant details so our agents can resolve your issue faster.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTicketForm />
        </CardContent>
      </Card>
    </section>
  );
}
