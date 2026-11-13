"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scale, FileText, Download, Eye, Shield, Users, Handshake, AlertTriangle, RefreshCw } from "lucide-react"
import { apiFetch } from "@/lib/api"

interface DocumentTemplate {
  id: string
  name: string
  description: string
  category: "contracts" | "legal" | "compliance" | "hr"
  complexity: "Simple" | "Medium" | "Complex"
  estimatedTime: string
  fields: DocumentField[]
  preview: string
}

interface DocumentField {
  id: string
  label: string
  type: "text" | "textarea" | "select" | "date" | "number"
  required: boolean
  options?: string[]
  placeholder?: string
}

const documentTemplates: DocumentTemplate[] = [
  {
    id: "nda",
    name: "Non-Disclosure Agreement (NDA)",
    description: "Protect confidential information shared with employees, contractors, or partners",
    category: "legal",
    complexity: "Simple",
    estimatedTime: "5 minutes",
    fields: [
      { id: "disclosing_party", label: "Disclosing Party (Your Company)", type: "text", required: true },
      { id: "receiving_party", label: "Receiving Party", type: "text", required: true },
      { id: "purpose", label: "Purpose of Disclosure", type: "textarea", required: true },
      {
        id: "duration",
        label: "Agreement Duration",
        type: "select",
        required: true,
        options: ["1 year", "2 years", "3 years", "5 years", "Indefinite"],
      },
      {
        id: "governing_law",
        label: "Governing Law (State)",
        type: "text",
        required: true,
        placeholder: "e.g., California",
      },
    ],
    preview: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on [DATE] between [DISCLOSING_PARTY] ("Disclosing Party") and [RECEIVING_PARTY] ("Receiving Party").

PURPOSE: The purpose of this Agreement is to protect confidential information related to [PURPOSE].

CONFIDENTIAL INFORMATION: All information disclosed by the Disclosing Party shall be considered confidential...`,
  },
  {
    id: "service_agreement",
    name: "Service Agreement",
    description: "Contract for providing services to clients or customers",
    category: "contracts",
    complexity: "Medium",
    estimatedTime: "10 minutes",
    fields: [
      { id: "service_provider", label: "Service Provider (Your Company)", type: "text", required: true },
      { id: "client", label: "Client Name", type: "text", required: true },
      { id: "services", label: "Services Description", type: "textarea", required: true },
      {
        id: "payment_terms",
        label: "Payment Terms",
        type: "select",
        required: true,
        options: ["Net 15", "Net 30", "Net 60", "Upon completion", "50% upfront, 50% on completion"],
      },
      {
        id: "project_duration",
        label: "Project Duration",
        type: "text",
        required: true,
        placeholder: "e.g., 3 months",
      },
      { id: "total_amount", label: "Total Contract Value ($)", type: "number", required: true },
    ],
    preview: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into between [SERVICE_PROVIDER] ("Provider") and [CLIENT] ("Client").

SERVICES: Provider agrees to perform the following services: [SERVICES]

PAYMENT: Client agrees to pay [TOTAL_AMOUNT] according to [PAYMENT_TERMS] terms...`,
  },
  {
    id: "employment_contract",
    name: "Employment Contract",
    description: "Standard employment agreement for hiring employees",
    category: "hr",
    complexity: "Complex",
    estimatedTime: "15 minutes",
    fields: [
      { id: "company_name", label: "Company Name", type: "text", required: true },
      { id: "employee_name", label: "Employee Name", type: "text", required: true },
      { id: "position", label: "Job Title/Position", type: "text", required: true },
      { id: "salary", label: "Annual Salary ($)", type: "number", required: true },
      { id: "start_date", label: "Start Date", type: "date", required: true },
      {
        id: "benefits",
        label: "Benefits Package",
        type: "textarea",
        required: false,
        placeholder: "Health insurance, 401k, vacation days, etc.",
      },
      {
        id: "employment_type",
        label: "Employment Type",
        type: "select",
        required: true,
        options: ["Full-time", "Part-time", "Contract", "Temporary"],
      },
    ],
    preview: `EMPLOYMENT AGREEMENT

This Employment Agreement is between [COMPANY_NAME] ("Company") and [EMPLOYEE_NAME] ("Employee").

POSITION: Employee is hired as [POSITION] starting [START_DATE].

COMPENSATION: Employee will receive an annual salary of $[SALARY]...`,
  },
  {
    id: "privacy_policy",
    name: "Privacy Policy",
    description: "GDPR and CCPA compliant privacy policy for your website/app",
    category: "compliance",
    complexity: "Medium",
    estimatedTime: "8 minutes",
    fields: [
      { id: "company_name", label: "Company Name", type: "text", required: true },
      { id: "website_url", label: "Website URL", type: "text", required: true },
      { id: "contact_email", label: "Contact Email", type: "text", required: true },
      {
        id: "data_types",
        label: "Types of Data Collected",
        type: "textarea",
        required: true,
        placeholder: "Email addresses, names, usage data, etc.",
      },
      { id: "data_usage", label: "How Data is Used", type: "textarea", required: true },
      {
        id: "third_parties",
        label: "Third-party Services",
        type: "textarea",
        required: false,
        placeholder: "Google Analytics, Stripe, etc.",
      },
    ],
    preview: `PRIVACY POLICY

Last updated: [DATE]

[COMPANY_NAME] ("we," "our," or "us") operates [WEBSITE_URL] (the "Service").

INFORMATION WE COLLECT: We collect the following types of information: [DATA_TYPES]

HOW WE USE INFORMATION: We use collected information for: [DATA_USAGE]...`,
  },
  {
    id: "terms_of_service",
    name: "Terms of Service",
    description: "Legal terms and conditions for your website or application",
    category: "legal",
    complexity: "Medium",
    estimatedTime: "10 minutes",
    fields: [
      { id: "company_name", label: "Company Name", type: "text", required: true },
      { id: "service_name", label: "Service/Product Name", type: "text", required: true },
      { id: "website_url", label: "Website URL", type: "text", required: true },
      { id: "contact_email", label: "Contact Email", type: "text", required: true },
      { id: "governing_law", label: "Governing Law (State/Country)", type: "text", required: true },
      { id: "service_description", label: "Service Description", type: "textarea", required: true },
    ],
    preview: `TERMS OF SERVICE

Last updated: [DATE]

These Terms of Service ("Terms") govern your use of [SERVICE_NAME] operated by [COMPANY_NAME].

ACCEPTANCE OF TERMS: By accessing and using our service, you accept and agree to be bound by these Terms...`,
  },
  {
    id: "founder_agreement",
    name: "Co-Founder Agreement",
    description: "Agreement between startup co-founders defining roles, equity, and responsibilities",
    category: "legal",
    complexity: "Complex",
    estimatedTime: "20 minutes",
    fields: [
      { id: "company_name", label: "Company Name", type: "text", required: true },
      { id: "founder1_name", label: "Founder 1 Name", type: "text", required: true },
      { id: "founder2_name", label: "Founder 2 Name", type: "text", required: true },
      { id: "founder1_equity", label: "Founder 1 Equity (%)", type: "number", required: true },
      { id: "founder2_equity", label: "Founder 2 Equity (%)", type: "number", required: true },
      {
        id: "vesting_schedule",
        label: "Vesting Schedule",
        type: "select",
        required: true,
        options: ["4 years with 1 year cliff", "3 years with 6 month cliff", "5 years with 1 year cliff"],
      },
      { id: "roles_responsibilities", label: "Roles and Responsibilities", type: "textarea", required: true },
    ],
    preview: `CO-FOUNDER AGREEMENT

This Co-Founder Agreement is between the founders of [COMPANY_NAME].

FOUNDERS: [FOUNDER1_NAME] and [FOUNDER2_NAME]

EQUITY DISTRIBUTION: 
- [FOUNDER1_NAME]: [FOUNDER1_EQUITY]%
- [FOUNDER2_NAME]: [FOUNDER2_EQUITY]%

VESTING: Equity will vest according to [VESTING_SCHEDULE]...`,
  },
]

export function LegalDocuments() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [startupName, setStartupName] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDocument, setGeneratedDocument] = useState<string>("")
  const [showPreview, setShowPreview] = useState(false)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "contracts":
        return <Handshake className="w-5 h-5" />
      case "legal":
        return <Scale className="w-5 h-5" />
      case "compliance":
        return <Shield className="w-5 h-5" />
      case "hr":
        return <Users className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Simple":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Complex":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const generateDocument = async () => {
  if (!selectedTemplate || !startupName) return;
  
  setIsGenerating(true);
  
  try {
    const response = await apiFetch("/generate-legal-document", {
      method: "POST",
      body: JSON.stringify({
        template_name: selectedTemplate.name,
        startup_name: startupName,
        form_data: formData,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate document");
    }

    const data = await response.json();
    setGeneratedDocument(data.document);
    setShowPreview(true);
  } catch (error) {
    console.error("Error generating document:", error);
    // Show error toast/notification here
  } finally {
    setIsGenerating(false);
  }
};

// Add this near your other functions (around line 50-60)
const downloadDocument = async () => {
  if (!generatedDocument) {
    alert("No document to download. Please generate a document first.");
    return;
  }

  try {
    setIsGenerating(true);
    
    const response = await apiFetch("/export-legal-pdf", {
      method: "POST",
      body: JSON.stringify({
        document: generatedDocument,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `legal_document_${new Date().getTime()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("Error downloading document:", error);
    alert("Failed to download PDF. Please try again.");
  } finally {
    setIsGenerating(false);
  }
};

const handleEditTemplate = () => {
  // Hide the preview and show the form again
  setShowPreview(false);
  
  // Optional: Scroll back to the form
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};
  const categories = [
    { id: "all", name: "All Documents", count: documentTemplates.length },
    { id: "legal", name: "Legal", count: documentTemplates.filter((t) => t.category === "legal").length },
    { id: "contracts", name: "Contracts", count: documentTemplates.filter((t) => t.category === "contracts").length },
    {
      id: "compliance",
      name: "Compliance",
      count: documentTemplates.filter((t) => t.category === "compliance").length,
    },
    { id: "hr", name: "HR", count: documentTemplates.filter((t) => t.category === "hr").length },
  ]

  const [activeCategory, setActiveCategory] = useState("all")
  const filteredTemplates =
    activeCategory === "all" ? documentTemplates : documentTemplates.filter((t) => t.category === activeCategory)

  return (
    <div className="space-y-4">

  <div>
    <h1 className="text-3xl font-bold text-foreground mb-2">
      Legal Document Generator
    </h1>
    <p className="text-muted-foreground">
      Generate professional legal documents, contracts, and compliance templates for your startup.
    </p>
  </div>

  <div className="max-w-md space-y-2">
    <Label>Startup Name</Label>

    <Input
      placeholder="Enter your startup name..."
      value={startupName}
      onChange={(e) => setStartupName(e.target.value)}
    />
  </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            onClick={() => setActiveCategory(category.id)}
            className="flex items-center gap-2"
          >
            {category.name}
            <Badge variant="secondary" className="ml-1">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {!selectedTemplate ? (
        /* Document Templates Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-primary">
                    {getCategoryIcon(template.category)}
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <Badge className={getComplexityColor(template.complexity)}>{template.complexity}</Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {template.estimatedTime}
                  </span>
                  <span className="text-sm text-muted-foreground">{template.fields.length} fields</span>
                </div>
                <div className="flex gap-2">
                  <Button
 size="sm"
 className="flex-1"
 disabled={!startupName}
 onClick={() => setSelectedTemplate(template)}
>
 Create Document
</Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{template.name} - Preview</DialogTitle>
                        <DialogDescription>Sample template content</DialogDescription>
                      </DialogHeader>
                      <div className="max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded">{template.preview}</pre>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Document Generation Form */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                ← Back to Templates
              </Button>
              <div>
                <h2 className="text-xl font-semibold">{selectedTemplate.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getComplexityColor(selectedTemplate.complexity)}>{selectedTemplate.complexity}</Badge>
              <Badge variant="outline">{selectedTemplate.estimatedTime}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Document Information
                </CardTitle>
                <CardDescription>Fill in the required information to generate your document.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
  <Label>Startup / Company Name</Label>
  <Input
    placeholder="Enter your startup name"
    value={startupName}
    onChange={(e) => setStartupName(e.target.value)}
  />
</div>

<Separator />
                {selectedTemplate.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === "text" && (
                      <Input
                        id={field.id}
                        placeholder={field.placeholder}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        required={field.required}
                      />
                    )}
                    {field.type === "textarea" && (
                      <Textarea
                        id={field.id}
                        placeholder={field.placeholder}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        required={field.required}
                        className="min-h-[80px]"
                      />
                    )}
                    {field.type === "select" && (
                      <Select
                        value={formData[field.id] || ""}
                        onValueChange={(value) => handleFieldChange(field.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {field.type === "date" && (
                      <Input
                        id={field.id}
                        type="date"
                        value={formData[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        required={field.required}
                      />
                    )}
                    {field.type === "number" && (
                      <Input
                        id={field.id}
                        type="number"
                        placeholder={field.placeholder}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}

                <Separator />

                <Button onClick={generateDocument} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Document...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Document
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Document Preview
                </CardTitle>
                <CardDescription>
                  {showPreview ? "Your generated document" : "Preview will appear after generation"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showPreview ? (
  <div className="space-y-4">
    <div className="max-h-96 overflow-y-auto border rounded p-4 bg-muted/50">
      <div
        className="bg-white p-8 border rounded text-sm leading-relaxed font-serif"
        dangerouslySetInnerHTML={{ __html: generatedDocument }}
      />
    </div>
    <div className="flex gap-2">
      <Button 
        onClick={downloadDocument} 
        className="flex-1"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download Document
          </>
        )}
      </Button>
      <Button 
        variant="outline" 
        className="flex-1 bg-transparent"
        onClick={handleEditTemplate}
      >
        <FileText className="w-4 h-4 mr-2" />
        Edit Template
      </Button>
    </div>
  </div>
) : (
  <div className="flex items-center justify-center h-96 text-muted-foreground">
    <div className="text-center">
      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>Fill in the form and click "Generate Document" to see your preview</p>
    </div>
  </div>
)}
              </CardContent>
            </Card>
          </div>

          {/* Legal Disclaimer */}
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Legal Disclaimer</h4>
                  <p className="text-sm text-yellow-700">
                    These templates are provided for informational purposes only and do not constitute legal advice. We
                    recommend consulting with a qualified attorney before using any legal documents for your business.
                    Laws vary by jurisdiction and your specific situation may require customization.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
