import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Building2, CheckCircle, XCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useThrottle } from '@/hooks/useThrottle';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import http from '@/api/http';
import endpoints from '@/api/endpoints';
import type { ICompany, CompanySize, CompanyType } from '@/types/index';

interface CompanyFormData {
  name: string;
  tagline?: string;
  description?: string;
  mission?: string;
  culture?: string;
  benefits?: string;
  industry?: string;
  companySize?: CompanySize;
  companyType?: CompanyType;
  yearEstablished?: number;
  website?: string;
  headquarters?: string;
  employeeCount?: number;
  logoUrl?: string;
  bannerUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  panNumber?: string;
  gstNumber?: string;
  cinNumber?: string;
}

interface CompanyApiResponse {
  data: ICompany[];
  pagination: {
    totalCompanies: number;
    pageCount: number;
    currentPage: number;
    hasNextPage: boolean;
  };
}

const COMPANY_SIZES: CompanySize[] = ['1-10', '11-50', '51-200', '201-500', '500+'];
const COMPANY_TYPES: CompanyType[] = ['startup', 'sme', 'mnc', 'government'];

const initialFormData: CompanyFormData = {
  name: '',
  tagline: '',
  description: '',
  mission: '',
  culture: '',
  benefits: '',
  industry: '',
  companySize: undefined,
  companyType: undefined,
  yearEstablished: undefined,
  website: '',
  headquarters: '',
  employeeCount: undefined,
  logoUrl: '',
  bannerUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  facebookUrl: '',
  panNumber: '',
  gstNumber: '',
  cinNumber: '',
};

// Helper function to clean form data before sending to API
const cleanFormData = (data: CompanyFormData) => {
  const cleaned: Record<string, unknown> = { ...data } as unknown as Record<string, unknown>;

  // Remove fields that shouldn't be in the DTO
  delete cleaned.slug;
  delete cleaned.location;
  delete cleaned.employerId;

  // Remove empty strings and undefined values
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === '' || cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });

  return cleaned;
};

export default function CompaniesListPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteCompanyId, setDeleteCompanyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce search input by 500ms
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [editingCompany, setEditingCompany] = useState<ICompany | null>(null);

  // Fetch companies list with pagination (uses debounced search to reduce API calls)
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['companies', page, limit, debouncedSearchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      });
      const response = await http.get(`${endpoints.company.list}?${params}`);
      return response as unknown as CompanyApiResponse;
    },
  });

  const companies: ICompany[] = companiesData?.data || [];
  const pagination = companiesData?.pagination;
  const total = pagination?.totalCompanies || 0;
  const totalPages = pagination?.pageCount || 1;
  const currentPage = pagination?.currentPage || page;
  const hasNextPage = pagination?.hasNextPage || false;

  // Create company mutation
  const getErrorMessage = (error: unknown) => {
    if (!error) return undefined;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const msg = (error as { message?: unknown }).message;
      return typeof msg === 'string' ? msg : undefined;
    }
    return undefined;
  };

  const createMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const cleanedData = cleanFormData(data);
      return await http.post(endpoints.company.create, cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company created successfully');
      setIsCreateOpen(false);
      setFormData(initialFormData);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to create company');
    },
  });

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CompanyFormData }) => {
      const cleanedData = cleanFormData(data);
      return await http.put(endpoints.company.update(id), cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company updated successfully');
      setIsEditOpen(false);
      setEditingCompany(null);
      setFormData(initialFormData);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to update company');
    },
  });

  // Delete company mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await http.delete(endpoints.company.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company deactivated successfully');
      setDeleteCompanyId(null);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to deactivate company');
    },
  });

  // Throttled create handler - prevents double-click submissions (2 second delay)
  const handleCreate = useThrottle(() => {
    if (!formData.name.trim()) {
      toast.error('Please enter company name');
      return;
    }
    createMutation.mutate(formData);
  }, 2000);

  const handleEdit = (company: ICompany) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      tagline: company.tagline || '',
      description: company.description || '',
      mission: company.mission || '',
      culture: company.culture || '',
      benefits: company.benefits || '',
      industry: company.industry || '',
      companySize: company.companySize,
      companyType: company.companyType,
      yearEstablished: company.yearEstablished || undefined,
      website: company.website || '',
      headquarters: company.headquarters || '',
      employeeCount: company.employeeCount || undefined,
      logoUrl: company.logoUrl || '',
      bannerUrl: company.bannerUrl || '',
      linkedinUrl: company.linkedinUrl || '',
      twitterUrl: company.twitterUrl || '',
      facebookUrl: company.facebookUrl || '',
      panNumber: company.panNumber || '',
      gstNumber: company.gstNumber || '',
      cinNumber: company.cinNumber || '',
    });
    setIsEditOpen(true);
  };

  // Throttled update handler - prevents double-click submissions (2 second delay)
  const handleUpdate = useThrottle(() => {
    if (!editingCompany) return;
    if (!formData.name.trim()) {
      toast.error('Please enter company name');
      return;
    }
    updateMutation.mutate({ id: editingCompany.id, data: formData });
  }, 2000);

  // Throttled delete handler - prevents accidental double-clicks (2 second delay)
  const handleDelete = useThrottle((id: string) => {
    deleteMutation.mutate(id);
  }, 2000);

  const handleCloseCreateDialog = () => {
    setIsCreateOpen(false);
    setFormData(initialFormData);
  };

  const handleCloseEditDialog = () => {
    setIsEditOpen(false);
    setEditingCompany(null);
    setFormData(initialFormData);
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
        <XCircle className="h-3 w-3" />
        Inactive
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const activeCompanies = companies.filter((c: ICompany) => c.isActive).length;
  const verifiedCompanies = companies.filter((c: ICompany) => c.isVerified).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies Management</h1>
          <p className="text-muted-foreground">Manage company profiles and information</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
              <DialogDescription>Add a new company profile to the platform</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Acme Corporation"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={formData.tagline}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, tagline: e.target.value }))
                      }
                      placeholder="Building the future of technology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, industry: e.target.value }))
                      }
                      placeholder="Technology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyType">Company Type</Label>
                    <Select
                      value={formData.companyType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, companyType: value as CompanyType }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select
                      value={formData.companySize}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, companySize: value as CompanySize }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size} employees
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="employeeCount">Employee Count</Label>
                    <Input
                      id="employeeCount"
                      type="number"
                      value={formData.employeeCount || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          employeeCount: e.target.value ? parseInt(e.target.value) : undefined,
                        }))
                      }
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearEstablished">Year Established</Label>
                    <Input
                      id="yearEstablished"
                      type="number"
                      value={formData.yearEstablished || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          yearEstablished: e.target.value ? parseInt(e.target.value) : undefined,
                        }))
                      }
                      placeholder="2020"
                      min="1800"
                      max="2100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="headquarters">Headquarters</Label>
                    <Input
                      id="headquarters"
                      value={formData.headquarters}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, headquarters: e.target.value }))
                      }
                      placeholder="Mumbai, India"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, website: e.target.value }))
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Media URLs */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Company Media</h3>
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <Label htmlFor="bannerUrl">Banner URL</Label>
                  <Input
                    id="bannerUrl"
                    type="url"
                    value={formData.bannerUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bannerUrl: e.target.value }))
                    }
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
              </div>

              {/* About Company */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">About Company</h3>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe the company..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="mission">Mission</Label>
                  <Textarea
                    id="mission"
                    value={formData.mission}
                    onChange={(e) => setFormData((prev) => ({ ...prev, mission: e.target.value }))}
                    placeholder="Company mission statement..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="culture">Culture</Label>
                  <Textarea
                    id="culture"
                    value={formData.culture}
                    onChange={(e) => setFormData((prev) => ({ ...prev, culture: e.target.value }))}
                    placeholder="Company culture and values..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => setFormData((prev) => ({ ...prev, benefits: e.target.value }))}
                    placeholder="Benefits offered to employees..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Social Media</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, linkedinUrl: e.target.value }))
                      }
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitterUrl">Twitter URL</Label>
                    <Input
                      id="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, twitterUrl: e.target.value }))
                      }
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebookUrl">Facebook URL</Label>
                    <Input
                      id="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, facebookUrl: e.target.value }))
                      }
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* KYC Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">KYC Information (India)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, panNumber: e.target.value }))
                      }
                      placeholder="ABCDE1234F"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, gstNumber: e.target.value }))
                      }
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cinNumber">CIN Number</Label>
                    <Input
                      id="cinNumber"
                      value={formData.cinNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, cinNumber: e.target.value }))
                      }
                      placeholder="U12345MH2020PTC123456"
                      maxLength={25}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseCreateDialog}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Company'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCompanies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedCompanies}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies by name, industry, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Companies List</CardTitle>
          <CardDescription>View and manage all company profiles</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No companies found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Headquarters</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company: ICompany) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{company.name}</div>
                            {company.tagline && (
                              <div className="text-xs text-muted-foreground">{company.tagline}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{company.industry || 'N/A'}</TableCell>
                      <TableCell className="capitalize">{company.companyType || 'N/A'}</TableCell>
                      <TableCell>{company.headquarters || 'N/A'}</TableCell>
                      <TableCell>{company.companySize || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(company.isVerified)}</TableCell>
                      <TableCell>{formatDate(company.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(company)}
                            title="Edit company"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteCompanyId(company.id)}
                            title="Delete company"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * limit + 1} to{' '}
                    {Math.min(currentPage * limit, total)} of {total} companies
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company profile information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="edit-name">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Acme Corporation"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-tagline">Tagline</Label>
                  <Input
                    id="edit-tagline"
                    value={formData.tagline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Building the future of technology"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-industry">Industry</Label>
                  <Input
                    id="edit-industry"
                    value={formData.industry}
                    onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                    placeholder="Technology"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-companyType">Company Type</Label>
                  <Select
                    value={formData.companyType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, companyType: value as CompanyType }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-companySize">Company Size</Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, companySize: value as CompanySize }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-employeeCount">Employee Count</Label>
                  <Input
                    id="edit-employeeCount"
                    type="number"
                    value={formData.employeeCount || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        employeeCount: e.target.value ? parseInt(e.target.value) : undefined,
                      }))
                    }
                    placeholder="150"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-yearEstablished">Year Established</Label>
                  <Input
                    id="edit-yearEstablished"
                    type="number"
                    value={formData.yearEstablished || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        yearEstablished: e.target.value ? parseInt(e.target.value) : undefined,
                      }))
                    }
                    placeholder="2020"
                    min="1800"
                    max="2100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-headquarters">Headquarters</Label>
                  <Input
                    id="edit-headquarters"
                    value={formData.headquarters}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, headquarters: e.target.value }))
                    }
                    placeholder="Mumbai, India"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-website">Website</Label>
                  <Input
                    id="edit-website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Media URLs */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Company Media</h3>
              <div>
                <Label htmlFor="edit-logoUrl">Logo URL</Label>
                <Input
                  id="edit-logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="edit-bannerUrl">Banner URL</Label>
                <Input
                  id="edit-bannerUrl"
                  type="url"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bannerUrl: e.target.value }))}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
            </div>

            {/* About Company */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">About Company</h3>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe the company..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-mission">Mission</Label>
                <Textarea
                  id="edit-mission"
                  value={formData.mission}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mission: e.target.value }))}
                  placeholder="Company mission statement..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="edit-culture">Culture</Label>
                <Textarea
                  id="edit-culture"
                  value={formData.culture}
                  onChange={(e) => setFormData((prev) => ({ ...prev, culture: e.target.value }))}
                  placeholder="Company culture and values..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="edit-benefits">Benefits</Label>
                <Textarea
                  id="edit-benefits"
                  value={formData.benefits}
                  onChange={(e) => setFormData((prev) => ({ ...prev, benefits: e.target.value }))}
                  placeholder="Benefits offered to employees..."
                  rows={2}
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Social Media</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="edit-linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="edit-linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, linkedinUrl: e.target.value }))
                    }
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                <div>
                  <Label htmlFor="edit-twitterUrl">Twitter URL</Label>
                  <Input
                    id="edit-twitterUrl"
                    value={formData.twitterUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, twitterUrl: e.target.value }))
                    }
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="edit-facebookUrl">Facebook URL</Label>
                  <Input
                    id="edit-facebookUrl"
                    value={formData.facebookUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, facebookUrl: e.target.value }))
                    }
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </div>

            {/* KYC Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">KYC Information (India)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-panNumber">PAN Number</Label>
                  <Input
                    id="edit-panNumber"
                    value={formData.panNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, panNumber: e.target.value }))
                    }
                    placeholder="ABCDE1234F"
                    maxLength={20}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-gstNumber">GST Number</Label>
                  <Input
                    id="edit-gstNumber"
                    value={formData.gstNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, gstNumber: e.target.value }))
                    }
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={20}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cinNumber">CIN Number</Label>
                  <Input
                    id="edit-cinNumber"
                    value={formData.cinNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, cinNumber: e.target.value }))
                    }
                    placeholder="U12345MH2020PTC123456"
                    maxLength={25}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCloseEditDialog}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Company'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCompanyId} onOpenChange={() => setDeleteCompanyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this company? This action will mark the company as
              inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCompanyId && handleDelete(deleteCompanyId)}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
