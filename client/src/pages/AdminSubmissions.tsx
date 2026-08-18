import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Search, Filter, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminSubmissions() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>("all");

  // Fetch submissions
  const { data: submissions, isLoading } = trpc.wizard.getSubmissions.useQuery();
  
  // Update status mutation
  const updateStatus = trpc.wizard.updateStatus.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      trpc.useUtils().wizard.getSubmissions.invalidate();
    },
  });
  
  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, status: status as any });
  };

  // Redirect if not admin
  if (!authLoading && (!user || user.role !== "admin")) {
    setLocation("/");
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.07_0.005_260)]">
        <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.5_0.2_25)]" />
      </div>
    );
  }

  // Filter submissions
  const filteredSubmissions = submissions?.filter((sub) => {
    const matchesSearch =
      searchTerm === "" ||
      sub.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
sub.businessName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      businessTypeFilter === "all" || sub.businessType === businessTypeFilter;

    return matchesSearch && matchesType;
  });

  // Export to CSV
  const handleExport = () => {
    if (!filteredSubmissions || filteredSubmissions.length === 0) return;

    const headers = [
      "Date",
      "Business Name",
      "Business Type",
      "Primary Goal",
      "Email",
      "Phone",
      "Color Scheme",
      "Design Style",
      "Goals",
      "Timeline",
      "Budget",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredSubmissions.map((sub) =>
        [
          new Date(sub.createdAt).toLocaleDateString(),
          `"${sub.businessName}"`,
          sub.businessType,
          `"${sub.primaryGoal || ""}"`,
          sub.email,
          sub.phone || "",
          sub.colorScheme || "",
          sub.designStyle || "",
          `"${sub.currentChallenges || ""}"`,
          sub.timeline || "",
          sub.budget || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `submissions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.005_260)] py-24">
      <div className="container max-w-7xl">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Onboarding Submissions
            </CardTitle>
            <CardDescription className="text-white/60">
              View and manage all customer onboarding wizard submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Search by business name, contact, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white/5 border-white/10 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="martial-arts">Martial Arts</SelectItem>
                  <SelectItem value="fitness">Fitness Studio</SelectItem>
                  <SelectItem value="wellness">Wellness/Health</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleExport}
                disabled={!filteredSubmissions || filteredSubmissions.length === 0}
                className="bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Results count */}
            <p className="text-sm text-white/60 mb-4">
              Showing {filteredSubmissions?.length || 0} of {submissions?.length || 0}{" "}
              submissions
            </p>

            {/* Table */}
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/80">Date</TableHead>
                    <TableHead className="text-white/80">Business</TableHead>
                    <TableHead className="text-white/80">Type</TableHead>
                    <TableHead className="text-white/80">Status</TableHead>
                    <TableHead className="text-white/80">Email</TableHead>
                    <TableHead className="text-white/80">Phone</TableHead>
                    <TableHead className="text-white/80">Timeline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions && filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((submission) => (
                      <TableRow
                        key={submission.id}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="text-white/80">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {submission.businessName}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {submission.businessType}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={submission.status}
                            onValueChange={(value) => handleStatusChange(submission.id, value)}
                          >
                            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                              <SelectItem value="won">Won</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-white/80">
                          {submission.email}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {submission.phone || "-"}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {submission.timeline || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-white/60 py-8"
                      >
                        No submissions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
