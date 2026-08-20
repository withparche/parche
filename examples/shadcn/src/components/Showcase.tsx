import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function Showcase() {
  const [email, setEmail] = useState('');
  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="flex flex-wrap gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Newsletter</CardTitle>
          <CardDescription>Real shadcn/ui components, themed entirely by Parche.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Button className="shrink-0" disabled={!email}>
            Subscribe
          </Button>
        </CardContent>
        <CardFooter className="gap-2">
          <Badge>Beta</Badge>
          <Badge variant="secondary">Free</Badge>
          <Badge variant="outline">v1</Badge>
        </CardFooter>
      </Card>
    </div>
  );
}
