import { Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CandidatesListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidates Management</h1>
          <p className="text-muted-foreground">Manage candidate profiles and applications</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Candidates management feature is coming soon. This section will allow you to view and
          manage all candidate profiles, resumes, and applications.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates List</CardTitle>
          <CardDescription>View and manage all candidate accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Candidates Management</h3>
            <p className="text-muted-foreground max-w-md">
              This feature is currently under development. Once available, you will be able to:
            </p>
            <ul className="mt-4 text-sm text-muted-foreground text-left space-y-2">
              <li>• View all candidate profiles</li>
              <li>• Search and filter candidates by skills, experience, and location</li>
              <li>• Review candidate applications and resumes</li>
              <li>• Manage candidate status and verification</li>
              <li>• Export candidate data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
