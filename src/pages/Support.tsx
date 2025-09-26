import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { BookOpen, HelpCircle, Search as SearchIcon, MessageCircle, Mail, LifeBuoy, FileText, UserCog } from "lucide-react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  category: string;
};

const ALL_FAQS: FaqItem[] = [
  {
    id: "getting-started-1",
    question: "How do I get started after signing up?",
    answer:
      "Go to Home → Create Roadmap to generate your first learning path. Explore recommendations on Explore, then follow steps in Roadmap View to track progress.",
    tags: ["getting-started", "roadmap", "explore"],
    category: "Getting Started",
  },
  {
    id: "roadmaps-1",
    question: "How to create a personalized roadmap?",
    answer:
      "Open Create Roadmap, enter your goal (e.g., 'Frontend Developer'), current skill level, and time commitment. The app generates steps, topics, and tasks.",
    tags: ["roadmap", "ai", "personalization"],
    category: "Roadmaps",
  },
  {
    id: "roadmaps-2",
    question: "Can I edit steps, topics, or tasks in a roadmap?",
    answer:
      "Yes. In Roadmap View, you can expand a step to see topics and tasks. Use the edit controls to reorder, mark complete, or add notes.",
    tags: ["roadmap", "steps", "tasks"],
    category: "Roadmaps",
  },
  {
    id: "posts-1",
    question: "How do posts and comments work?",
    answer:
      "From Home, use Create Post to share insights or resources. You can like, bookmark, comment, and share posts from the feed.",
    tags: ["posts", "comments", "bookmarks", "share"],
    category: "Posts",
  },
  {
    id: "account-1",
    question: "How do I change my profile info or privacy settings?",
    answer:
      "Open Settings from the top right menu. Update Account details, Notifications, Privacy, and Security preferences.",
    tags: ["settings", "privacy", "security"],
    category: "Account",
  },
  {
    id: "search-1",
    question: "How do I search for skills or resources?",
    answer:
      "Use the top search bar to find skills, domains, and exams. Results appear on the Search page where you can refine your query.",
    tags: ["search", "skills", "resources"],
    category: "Search",
  },
  {
    id: "troubleshoot-1",
    question: "I can’t sign in or see my data.",
    answer:
      "Ensure you’re logged in. If issues persist, sign out and sign back in. Clear your browser cache. If still broken, contact support with details.",
    tags: ["login", "bug", "cache"],
    category: "Troubleshooting",
  },
  {
    id: "saved-1",
    question: "Where can I find my saved posts?",
    answer:
      "Open the top menu → Saved Posts. You can also see bookmarks reflected on your Home feed.",
    tags: ["saved", "bookmarks"],
    category: "Posts",
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "Getting Started", label: "Getting Started" },
  { id: "Roadmaps", label: "Roadmaps" },
  { id: "Posts", label: "Posts" },
  { id: "Account", label: "Account" },
  { id: "Search", label: "Search" },
  { id: "Troubleshooting", label: "Troubleshooting" },
];

const guides = [
  {
    id: "guide-1",
    title: "Create your first AI roadmap",
    icon: BookOpen,
    description: "Step-by-step walkthrough to generate and customize a learning path.",
    to: "/create-roadmap",
  },
  {
    id: "guide-2",
    title: "Follow and complete roadmap steps",
    icon: FileText,
    description: "Expand steps, explore topics, and check off tasks as you learn.",
    to: "/roadmaps",
  },
  {
    id: "guide-3",
    title: "Tune your account and privacy",
    icon: UserCog,
    description: "Control notifications, visibility, and security preferences.",
    to: "/settings",
  },
];

const Support = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredFaqs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return ALL_FAQS.filter((f) => {
      const matchesCategory = activeCategory === "all" || f.category === activeCategory;
      if (!matchesCategory) return false;
      if (!normalized) return true;
      const haystack = `${f.question} ${f.answer} ${f.tags.join(" ")}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, activeCategory]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <LifeBuoy className="h-6 w-6" /> Support Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Find guides, FAQs, and troubleshooting tips. Search for anything you need.
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 'roadmap steps', 'bookmarks', 'privacy', ..."
                className="pl-10 h-10"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v)}
          className="space-y-6"
        >
          <div className="w-full overflow-x-auto">
            <TabsList className="flex w-max md:w-full md:grid md:grid-cols-6 gap-2 md:gap-0">
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="whitespace-nowrap">
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {CATEGORIES.map((c) => (
            <TabsContent key={c.id} value={c.id}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" /> Frequently Asked Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {filteredFaqs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No results. Try different keywords.</p>
                      ) : (
                        <Accordion type="single" collapsible className="w-full">
                          {filteredFaqs.map((f) => (
                            <AccordionItem key={f.id} value={f.id}>
                              <AccordionTrigger className="text-left">
                                <div className="flex items-center gap-2">
                                  <span>{f.question}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <p className="text-sm leading-6">{f.answer}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {f.tags.map((t) => (
                                    <Badge key={t} variant="secondary">{t}</Badge>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" /> Still need help?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        You can reach out with details like what you tried and screenshots.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a href="mailto:support@skillmetrics.example" className="inline-flex">
                          <Button variant="default" className="gap-2">
                            <Mail className="h-4 w-4" /> Email support
                          </Button>
                        </a>
                        <Link to="/settings" className="inline-flex">
                          <Button variant="outline" className="gap-2">
                            <UserCog className="h-4 w-4" /> Review settings
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-1 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" /> Quick Guides
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {guides.map((g) => (
                        <Link to={g.to} key={g.id} className="block">
                          <div className="flex items-start gap-3 rounded-md border p-3 hover:bg-accent/40 transition-colors">
                            <g.icon className="h-5 w-5 mt-0.5" />
                            <div>
                              <div className="font-medium leading-6">{g.title}</div>
                              <div className="text-sm text-muted-foreground">{g.description}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <div>Use bookmarks on posts to build your reading list.</div>
                      <Separator />
                      <div>Try dark theme from the top-right menu for night study.</div>
                      <Separator />
                      <div>Refine your search queries by adding specific skills.</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Support;


