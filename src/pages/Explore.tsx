import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DetailsModal } from "@/components/DetailsModal";
import { 
  Search, 
  TrendingUp, 
  Code, 
  Palette, 
  Database, 
  Brain, 
  Shield,
  Smartphone,
  Users,
  Star,
  Clock,
  BookOpen,
  ExternalLink,
  Bookmark,
  Play
} from "lucide-react";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'skill' | 'certification' | 'path' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = [
    { name: "Programming", icon: Code, count: 245, color: "bg-blue-500" },
    { name: "Design", icon: Palette, count: 128, color: "bg-pink-500" },
    { name: "Data Science", icon: Database, count: 187, color: "bg-green-500" },
    { name: "AI/ML", icon: Brain, count: 156, color: "bg-purple-500" },
    { name: "Cybersecurity", icon: Shield, count: 89, color: "bg-red-500" },
    { name: "Mobile Dev", icon: Smartphone, count: 134, color: "bg-orange-500" }
  ];

  const trendingSkills = [
    {
      name: "CS50's Introduction to Computer Science",
      category: "Computer Science",
      learners: "4.2M",
      difficulty: "Beginner",
      rating: 4.9,
      trending: true,
      description: "Harvard's introduction to computer science and programming",
      link: "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
      prerequisites: ["High school mathematics", "No prior programming experience required"],
      curriculum: [
        "Week 0: Scratch",
        "Week 1: C Programming",
        "Week 2: Arrays and Strings",
        "Week 3: Algorithms",
        "Week 4: Memory Management",
        "Week 5: Data Structures",
        "Week 6: Python",
        "Week 7: SQL",
        "Week 8: HTML, CSS, JavaScript",
        "Week 9: Flask",
        "Final Project"
      ],
      skillsGained: ["C Programming", "Python", "HTML/CSS", "JavaScript", "SQL", "Algorithms", "Data Structures"],
      learningObjectives: [
        "Think algorithmically and solve problems efficiently",
        "Understand computer science concepts and terminology",
        "Write programs in C, Python, and JavaScript",
        "Build web applications using HTML, CSS, and Flask",
        "Work with databases using SQL"
      ],
      estimatedTime: "10-11 weeks"
    },
    {
      name: "Responsive Web Design",
      category: "Web Development",
      learners: "2.8M",
      difficulty: "Beginner",
      rating: 4.8,
      trending: true,
      description: "Learn HTML, CSS, and responsive design principles with freeCodeCamp",
      link: "https://www.freecodecamp.org/learn/responsive-web-design/",
      prerequisites: ["Basic computer literacy", "No prior experience required"],
      curriculum: [
        "Basic HTML and HTML5",
        "Basic CSS",
        "Applied Visual Design",
        "Applied Accessibility",
        "Responsive Web Design Principles",
        "CSS Flexbox",
        "CSS Grid"
      ],
      skillsGained: ["HTML5", "CSS3", "Responsive Design", "Accessibility", "Flexbox", "CSS Grid"],
      learningObjectives: [
        "Create web pages using HTML elements",
        "Style web pages with CSS",
        "Build responsive layouts that work on all devices",
        "Implement accessibility best practices",
        "Use modern CSS layout techniques"
      ],
      estimatedTime: "300 hours"
    },
    {
      name: "JavaScript Algorithms and Data Structures",
      category: "Programming",
      learners: "1.9M",
      difficulty: "Intermediate",
      rating: 4.9,
      trending: true,
      description: "ES6, regular expressions, basic algorithm scripting",
      link: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
      prerequisites: ["Basic HTML and CSS knowledge", "Programming fundamentals"],
      curriculum: [
        "Basic JavaScript",
        "ES6",
        "Regular Expressions",
        "Debugging",
        "Basic Data Structures",
        "Basic Algorithm Scripting",
        "Object Oriented Programming",
        "Functional Programming",
        "Intermediate Algorithm Scripting",
        "JavaScript Algorithms and Data Structures Projects"
      ],
      skillsGained: ["JavaScript ES6+", "Algorithms", "Data Structures", "Problem Solving", "Functional Programming"],
      learningObjectives: [
        "Master JavaScript fundamentals and ES6 features",
        "Implement common algorithms and data structures",
        "Solve complex programming challenges",
        "Write clean, efficient JavaScript code",
        "Build JavaScript projects from scratch"
      ],
      estimatedTime: "300 hours"
    },
    {
      name: "Google Data Analytics Professional Certificate",
      category: "Data Science",
      learners: "1.2M",
      difficulty: "Beginner",
      rating: 4.7,
      trending: true,
      description: "Job-ready skills in data analytics, Tableau, R, and SQL",
      link: "https://www.coursera.org/professional-certificates/google-data-analytics",
      prerequisites: ["High school mathematics", "Basic computer skills", "No prior experience required"],
      curriculum: [
        "Foundations: Data, Data, Everywhere",
        "Ask Questions to Make Data-Driven Decisions",
        "Prepare Data for Exploration",
        "Process Data from Dirty to Clean",
        "Analyze Data to Answer Questions",
        "Share Data Through the Art of Visualization",
        "Data Analysis with R Programming",
        "Google Data Analytics Capstone: Complete a Case Study"
      ],
      skillsGained: ["Data Analysis", "SQL", "Tableau", "R Programming", "Data Visualization", "Spreadsheets"],
      learningObjectives: [
        "Clean and organize data for analysis",
        "Complete analysis and calculations using SQL, R, and spreadsheets",
        "Create visualizations and dashboards using Tableau",
        "Present findings and recommendations to stakeholders",
        "Apply the data analysis process to real-world scenarios"
      ],
      estimatedTime: "3-6 months"
    },
    {
      name: "Python for Everybody",
      category: "Programming",
      learners: "2.1M",
      difficulty: "Beginner",
      rating: 4.8,
      trending: false,
      description: "Learn Python programming fundamentals from University of Michigan",
      link: "https://www.coursera.org/specializations/python",
      prerequisites: ["Basic computer literacy", "High school mathematics", "No programming experience required"],
      curriculum: [
        "Programming for Everybody (Getting Started with Python)",
        "Python Data Structures",
        "Using Python to Access Web Data",
        "Using Databases with Python",
        "Capstone: Retrieving, Processing, and Visualizing Data with Python"
      ],
      skillsGained: ["Python Programming", "Data Structures", "Web Scraping", "Database Programming", "Data Visualization"],
      learningObjectives: [
        "Learn Python syntax and programming concepts",
        "Work with data structures like lists, dictionaries, and tuples",
        "Extract data from web APIs and HTML",
        "Store and retrieve data using databases",
        "Create data visualizations and reports"
      ],
      estimatedTime: "8 months"
    },
    {
      name: "Google UX Design Professional Certificate",
      category: "Design",
      learners: "850k",
      difficulty: "Beginner",
      rating: 4.8,
      trending: true,
      description: "User experience design and research fundamentals",
      link: "https://www.coursera.org/professional-certificates/google-ux-design",
      prerequisites: ["No design experience required", "Basic computer skills", "Creative mindset"],
      curriculum: [
        "Foundations of User Experience (UX) Design",
        "Start the UX Design Process: Empathize, Define, and Ideate",
        "Build Wireframes and Low-Fidelity Prototypes",
        "Conduct UX Research and Test Early Concepts",
        "Create High-Fidelity Designs and Prototypes in Figma",
        "Build Dynamic User Interfaces (UI) for Websites",
        "Design a User Experience for Social Good & Prepare for Jobs"
      ],
      skillsGained: ["UX Design", "User Research", "Wireframing", "Prototyping", "Figma", "Usability Testing"],
      learningObjectives: [
        "Understand the UX design process and methodology",
        "Conduct user research and create user personas",
        "Create wireframes and prototypes using Figma",
        "Test and iterate on designs based on user feedback",
        "Build a professional UX design portfolio"
      ],
      estimatedTime: "3-6 months"
    },
    {
      name: "AWS Cloud Practitioner Essentials",
      category: "Cloud Computing",
      learners: "650k",
      difficulty: "Beginner",
      rating: 4.7,
      trending: false,
      description: "Introduction to AWS cloud computing concepts",
      link: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/",
      prerequisites: ["Basic IT knowledge", "Understanding of networking concepts", "No AWS experience required"],
      curriculum: [
        "Introduction to Amazon Web Services",
        "Compute in the Cloud",
        "Global Infrastructure and Reliability",
        "Networking",
        "Storage and Databases",
        "Security",
        "Monitoring and Analytics",
        "Pricing and Support"
      ],
      skillsGained: ["AWS Fundamentals", "Cloud Computing", "AWS Services", "Cloud Security", "Cost Management"],
      learningObjectives: [
        "Define what the AWS Cloud is and the basic global infrastructure",
        "Describe basic AWS Cloud architectural principles",
        "Describe the AWS Cloud value proposition",
        "Describe key services on the AWS platform",
        "Describe basic security and compliance aspects of the AWS platform"
      ],
      estimatedTime: "6 hours"
    },
    {
      name: "Machine Learning",
      category: "AI/ML",
      learners: "4.7M",
      difficulty: "Intermediate",
      rating: 4.9,
      trending: true,
      description: "Stanford's famous machine learning course by Andrew Ng",
      link: "https://www.coursera.org/learn/machine-learning",
      prerequisites: ["Linear algebra", "Calculus", "Programming experience (any language)", "Statistics basics"],
      curriculum: [
        "Introduction to Machine Learning",
        "Linear Regression with One Variable",
        "Linear Regression with Multiple Variables",
        "Logistic Regression",
        "Regularization",
        "Neural Networks: Representation",
        "Neural Networks: Learning",
        "Advice for Applying Machine Learning",
        "Machine Learning System Design",
        "Support Vector Machines",
        "Unsupervised Learning",
        "Dimensionality Reduction",
        "Anomaly Detection",
        "Recommender Systems",
        "Large Scale Machine Learning"
      ],
      skillsGained: ["Machine Learning", "Neural Networks", "MATLAB/Octave", "Algorithm Design", "Data Analysis"],
      learningObjectives: [
        "Understand machine learning algorithms and when to apply them",
        "Implement ML algorithms from scratch",
        "Apply ML to real-world problems",
        "Understand best practices in ML system design",
        "Evaluate and improve ML model performance"
      ],
      estimatedTime: "11 weeks"
    },
    {
      name: "Khan Academy Programming",
      category: "Programming",
      learners: "3.2M",
      difficulty: "Beginner",
      rating: 4.5,
      trending: false,
      description: "Intro to programming with JavaScript and web development",
      link: "https://www.khanacademy.org/computing/computer-programming",
      prerequisites: ["Basic computer skills", "No programming experience required"],
      curriculum: [
        "Intro to Programming",
        "Drawing & Animation",
        "Interactive Programs",
        "Games & Visualizations",
        "Intro to HTML/CSS",
        "HTML/JS: Making webpages interactive",
        "HTML/JS: Making webpages interactive with jQuery",
        "Intro to SQL",
        "Advanced JS: Games & Visualizations",
        "Advanced JS: Natural Simulations"
      ],
      skillsGained: ["JavaScript", "HTML/CSS", "Programming Logic", "Web Development", "SQL", "jQuery"],
      learningObjectives: [
        "Learn fundamental programming concepts",
        "Create interactive programs and animations",
        "Build web pages with HTML and CSS",
        "Make web pages interactive with JavaScript",
        "Work with databases using SQL",
        "Develop problem-solving skills"
      ],
      estimatedTime: "Self-paced"
    }
  ];

  const examCertifications = [
    {
      name: "AWS Solutions Architect Associate",
      provider: "Amazon Web Services",
      difficulty: "Associate",
      passingScore: "72%",
      avgSalary: "$130k",
      nextExam: "Available Year-round",
      duration: "130 minutes",
      cost: "$150",
      description: "Design distributed systems on AWS platform",
      link: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
      prerequisites: ["Basic AWS knowledge", "Networking fundamentals", "Security concepts"],
      examTopics: [
        "Design Resilient Architectures (30%)",
        "Design High-Performing Architectures (28%)",
        "Design Secure Applications and Architectures (24%)",
        "Design Cost-Optimized Architectures (18%)"
      ],
      studyMaterials: [
        "AWS Training and Certification",
        "AWS Whitepapers",
        "Hands-on Labs",
        "Practice Exams",
        "AWS Documentation",
        "Community Forums"
      ],
      skillsValidated: ["AWS Architecture", "Security", "Cost Optimization", "Performance", "Reliability"],
      careerPaths: ["Solutions Architect", "Cloud Architect", "DevOps Engineer", "Cloud Consultant"]
    },
    {
      name: "Google Professional Cloud Architect",
      provider: "Google Cloud",
      difficulty: "Professional",
      passingScore: "70%",
      avgSalary: "$139k",
      nextExam: "Available Year-round",
      duration: "2 hours",
      cost: "$200",
      description: "Design and manage scalable, reliable Google Cloud solutions",
      link: "https://cloud.google.com/certification/cloud-architect",
      prerequisites: ["3+ years cloud experience", "Google Cloud fundamentals", "Solution architecture experience"],
      examTopics: [
        "Designing and planning a cloud solution architecture (24%)",
        "Managing and provisioning a solution infrastructure (20%)",
        "Designing for security and compliance (20%)",
        "Analyzing and optimizing technical and business processes (18%)",
        "Managing implementations of cloud architecture (18%)"
      ],
      studyMaterials: [
        "Google Cloud Training",
        "Hands-on Labs",
        "Practice Exams",
        "Cloud Architecture Center",
        "Google Cloud Documentation",
        "Case Studies"
      ],
      skillsValidated: ["Cloud Architecture", "Google Cloud Platform", "Solution Design", "Security", "Cost Optimization"],
      careerPaths: ["Cloud Architect", "Solutions Architect", "Cloud Engineer", "Technical Lead"]
    },
    {
      name: "Google IT Support Professional Certificate",
      provider: "Google (Coursera)",
      difficulty: "Beginner",
      passingScore: "N/A",
      avgSalary: "$50k",
      nextExam: "Self-paced",
      duration: "3-6 months",
      cost: "Free to audit",
      description: "Technical support fundamentals and troubleshooting",
      link: "https://www.coursera.org/professional-certificates/google-it-support",
      prerequisites: ["Basic computer literacy", "Problem-solving mindset", "No prior IT experience required"],
      examTopics: [
        "Technical Support Fundamentals",
        "Computer Networking",
        "Operating Systems",
        "System Administration and IT Infrastructure",
        "IT Security: Defense against the digital dark arts"
      ],
      studyMaterials: [
        "Interactive Labs",
        "Video Lectures",
        "Hands-on Practice",
        "Qwiklabs",
        "Discussion Forums",
        "Career Resources"
      ],
      skillsValidated: ["Troubleshooting", "Networking", "Operating Systems", "System Administration", "Customer Service"],
      careerPaths: ["Help Desk Technician", "IT Support Specialist", "Desktop Support", "Technical Support"]
    },
    {
      name: "Microsoft Azure Fundamentals",
      provider: "Microsoft",
      difficulty: "Beginner",
      passingScore: "70%",
      avgSalary: "$85k",
      nextExam: "Available Year-round",
      duration: "45 minutes",
      cost: "$99",
      description: "Azure cloud services and solutions fundamentals",
      link: "https://docs.microsoft.com/en-us/learn/certifications/azure-fundamentals/",
      prerequisites: ["Basic cloud concepts", "General technology knowledge", "No Azure experience required"],
      examTopics: [
        "Cloud Concepts (25-30%)",
        "Azure Services (35-40%)",
        "Security, Privacy, Compliance, and Trust (25-30%)",
        "Azure Pricing and Support (25-30%)"
      ],
      studyMaterials: [
        "Microsoft Learn",
        "Free Azure Account",
        "Practice Assessments",
        "Azure Documentation",
        "Learning Paths",
        "Virtual Training Days"
      ],
      skillsValidated: ["Azure Services", "Cloud Computing", "Security", "Compliance", "Pricing Models"],
      careerPaths: ["Cloud Administrator", "Azure Developer", "Solutions Architect", "DevOps Engineer"]
    },
    {
      name: "IBM Data Science Professional Certificate",
      provider: "IBM (Coursera)",
      difficulty: "Beginner",
      passingScore: "N/A",
      avgSalary: "$95k",
      nextExam: "Self-paced",
      duration: "3-11 months",
      cost: "Free to audit",
      description: "Python, SQL, machine learning, and data visualization",
      link: "https://www.coursera.org/professional-certificates/ibm-data-science",
      prerequisites: ["Basic math skills", "High school level statistics", "No programming experience required"],
      examTopics: [
        "Data Science Methodology",
        "Python for Data Science, AI & Development",
        "Python Project for Data Science",
        "Databases and SQL for Data Science",
        "Data Analysis with Python",
        "Data Visualization with Python",
        "Machine Learning with Python",
        "Applied Data Science Capstone"
      ],
      studyMaterials: [
        "Hands-on Labs",
        "Jupyter Notebooks",
        "Real-world Projects",
        "Peer Reviews",
        "Industry Tools",
        "Portfolio Development"
      ],
      skillsValidated: ["Python", "SQL", "Data Analysis", "Machine Learning", "Data Visualization", "Data Science"],
      careerPaths: ["Data Scientist", "Data Analyst", "Machine Learning Engineer", "Business Intelligence Analyst"]
    },
    {
      name: "Google Digital Marketing & E-commerce",
      provider: "Google (Coursera)",
      difficulty: "Beginner",
      passingScore: "N/A",
      avgSalary: "$55k",
      nextExam: "Self-paced",
      duration: "3-6 months",
      cost: "Free to audit",
      description: "Digital marketing strategy and e-commerce fundamentals",
      link: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce",
      prerequisites: ["Basic computer skills", "Interest in marketing", "No prior experience required"],
      examTopics: [
        "Foundations of Digital Marketing and E-commerce",
        "Attract and Engage Customers with Digital Marketing",
        "From Likes to Leads: Interact with Customers Online",
        "Think Outside the Inbox: Email Marketing",
        "Assess for Success: Marketing Analytics and Measurement",
        "Make the Sale: Build, Launch, and Manage E-commerce Stores",
        "Satisfaction Guaranteed: Develop Customer Loyalty Online"
      ],
      studyMaterials: [
        "Interactive Content",
        "Real-world Case Studies",
        "Hands-on Activities",
        "Industry Tools Access",
        "Portfolio Projects",
        "Career Support"
      ],
      skillsValidated: ["Digital Marketing", "E-commerce", "Social Media Marketing", "Email Marketing", "Analytics", "SEO"],
      careerPaths: ["Digital Marketing Specialist", "E-commerce Manager", "Social Media Manager", "Marketing Analyst"]
    }
  ];

  const learningPaths = [
    {
      title: "Full Stack Web Development",
      description: "Complete curriculum from HTML/CSS to full-stack JavaScript",
      duration: "1,800 hours",
      skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "Databases"],
      level: "Beginner to Advanced",
      students: "2.8M",
      rating: 4.8,
      price: "Free",
      projects: 20,
      link: "https://www.freecodecamp.org/learn/",
      prerequisites: ["Basic computer literacy", "No programming experience required"],
      modules: [
        "Responsive Web Design",
        "JavaScript Algorithms and Data Structures",
        "Front End Development Libraries",
        "Data Visualization",
        "Back End Development and APIs",
        "Quality Assurance",
        "Scientific Computing with Python",
        "Data Analysis with Python",
        "Information Security",
        "Machine Learning with Python"
      ],
      learningOutcomes: [
        "Build responsive websites with HTML and CSS",
        "Program interactive applications with JavaScript",
        "Create dynamic user interfaces with React",
        "Develop server-side applications with Node.js",
        "Work with databases and APIs",
        "Implement security best practices"
      ],
      tools: ["VS Code", "Git", "GitHub", "Node.js", "React", "Express", "MongoDB"],
      assignments: [
        "Build a Tribute Page",
        "Build a Survey Form",
        "Build a Product Landing Page",
        "Build a Technical Documentation Page",
        "Build a Personal Portfolio Webpage",
        "JavaScript Calculator",
        "Pomodoro Clock",
        "Random Quote Machine",
        "Markdown Previewer",
        "Drum Machine"
      ]
    },
    {
      title: "Data Scientist Nanodegree",
      description: "Data pipelines, experiments, recommendation systems",
      duration: "4 months",
      skills: ["Python", "Machine Learning", "Statistics", "SQL", "Data Visualization"],
      level: "Intermediate",
      students: "15.2k",
      rating: 4.9,
      price: "$399/month",
      projects: 8,
      link: "https://www.udacity.com/course/data-scientist-nanodegree--nd025",
      prerequisites: ["Python programming", "Statistics knowledge", "SQL basics", "Linear algebra"],
      modules: [
        "Data Science Process",
        "Software Engineering for Data Scientists",
        "Data Engineering",
        "Experiment Design and Recommendations",
        "Data Science Projects"
      ],
      learningOutcomes: [
        "Build data pipelines to collect and process data",
        "Design and run A/B tests to make business decisions",
        "Build recommendation engines using collaborative filtering",
        "Deploy machine learning models to production",
        "Communicate findings to stakeholders effectively"
      ],
      tools: ["Python", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "AWS", "Spark", "Jupyter"],
      assignments: [
        "Finding Donors for CharityML",
        "Image Classifier Project",
        "Data Engineering Pipeline",
        "Experimental Design and Recommendations",
        "Data Science Capstone Project"
      ]
    },
    {
      title: "Cloud Development Path",
      description: "AWS, Azure, Docker, and Kubernetes fundamentals",
      duration: "40 hours",
      skills: ["AWS", "Azure", "Docker", "Kubernetes", "DevOps"],
      level: "Beginner to Advanced",
      students: "8.9k",
      rating: 4.7,
      price: "$29/month",
      projects: 15,
      link: "https://www.pluralsight.com/paths/cloud-development",
      prerequisites: ["Basic programming knowledge", "Understanding of web technologies", "System administration basics"],
      modules: [
        "Introduction to Cloud Computing",
        "Amazon Web Services (AWS) Fundamentals",
        "Microsoft Azure Fundamentals", 
        "Container Technologies with Docker",
        "Orchestration with Kubernetes",
        "DevOps and CI/CD Pipelines",
        "Cloud Security Best Practices",
        "Monitoring and Logging in the Cloud"
      ],
      learningOutcomes: [
        "Deploy applications to multiple cloud platforms",
        "Containerize applications using Docker",
        "Orchestrate containers with Kubernetes",
        "Implement CI/CD pipelines for cloud deployment",
        "Monitor and scale cloud applications",
        "Implement cloud security best practices"
      ],
      tools: ["AWS CLI", "Azure CLI", "Docker", "Kubernetes", "Terraform", "Jenkins", "Grafana", "Prometheus"],
      assignments: [
        "Deploy a Web App to AWS",
        "Build Docker Containers",
        "Set up Kubernetes Cluster",
        "Create CI/CD Pipeline",
        "Implement Auto-scaling",
        "Cloud Security Audit"
      ]
    },
    {
      title: "Machine Learning Engineering for Production",
      description: "MLOps, TensorFlow, and production ML systems",
      duration: "6-12 months",
      skills: ["MLOps", "TensorFlow", "Kubernetes", "Production ML", "Data Engineering"],
      level: "Intermediate",
      students: "12.8k",
      rating: 4.6,
      price: "$49/month",
      projects: 11,
      link: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops",
      prerequisites: ["Machine learning fundamentals", "Python programming", "TensorFlow experience", "Basic cloud knowledge"],
      modules: [
        "Introduction to Machine Learning in Production",
        "Machine Learning Data Lifecycle in Production",
        "Machine Learning Modeling Pipelines in Production",
        "Deploying Machine Learning Models in Production"
      ],
      learningOutcomes: [
        "Design and build production ML systems",
        "Implement MLOps best practices and workflows",
        "Deploy and monitor ML models at scale",
        "Handle data versioning and model governance",
        "Optimize model performance in production",
        "Troubleshoot and maintain ML systems"
      ],
      tools: ["TensorFlow", "Kubeflow", "Apache Airflow", "Docker", "Kubernetes", "TensorBoard", "MLflow", "Google Cloud"],
      assignments: [
        "Deploy a TensorFlow Model",
        "Build ML Pipeline with Apache Beam",
        "Model Monitoring Dashboard",
        "A/B Testing for ML Models",
        "MLOps Pipeline Design",
        "Production ML System Capstone"
      ]
    },
    {
      title: "Frontend Master Path",
      description: "React, TypeScript, and modern frontend development",
      duration: "6 months",
      skills: ["React", "TypeScript", "CSS", "JavaScript", "Testing"],
      level: "Beginner to Intermediate",
      students: "11.3k",
      rating: 4.8,
      price: "$39.99/month",
      projects: 10,
      link: "https://www.codecademy.com/learn/paths/front-end-engineer-career-path",
      prerequisites: ["Basic HTML/CSS knowledge", "JavaScript fundamentals", "Understanding of web development"],
      modules: [
        "Web Development Foundations",
        "Building Interactive Websites",
        "React Development",
        "TypeScript Fundamentals",
        "Advanced React Patterns",
        "Testing and Debugging",
        "Frontend Performance Optimization",
        "Modern CSS and Styling"
      ],
      learningOutcomes: [
        "Build responsive and interactive web applications",
        "Master React ecosystem and component architecture",
        "Write type-safe code with TypeScript",
        "Implement testing strategies for frontend applications",
        "Optimize application performance and accessibility",
        "Work with modern frontend tools and workflows"
      ],
      tools: ["React", "TypeScript", "Webpack", "Jest", "CSS-in-JS", "Storybook", "Git", "VS Code"],
      assignments: [
        "Personal Portfolio Website",
        "Interactive React Dashboard",
        "TypeScript Todo Application",
        "E-commerce Product Catalog",
        "Testing Suite Implementation",
        "Performance Optimization Project"
      ]
    },
    {
      title: "Khan Academy Programming",
      description: "Intro to programming with JavaScript and web development",
      duration: "Self-paced",
      skills: ["JavaScript", "HTML/CSS", "Web Development", "Computer Science"],
      level: "Beginner",
      students: "3.2M",
      rating: 4.5,
      price: "Free",
      projects: 6,
      link: "https://www.khanacademy.org/computing/computer-programming",
      prerequisites: ["Basic computer skills", "No programming experience required"],
      modules: [
        "Intro to Programming",
        "Drawing & Animation",
        "Interactive Programs",
        "Games & Visualizations",
        "Intro to HTML/CSS",
        "HTML/JS: Making webpages interactive",
        "HTML/JS: Making webpages interactive with jQuery",
        "Intro to SQL",
        "Advanced JS: Games & Visualizations",
        "Advanced JS: Natural Simulations"
      ],
      learningOutcomes: [
        "Learn fundamental programming concepts",
        "Create interactive programs and animations",
        "Build web pages with HTML and CSS",
        "Make web pages interactive with JavaScript",
        "Work with databases using SQL",
        "Develop problem-solving skills"
      ],
      tools: ["Khan Academy IDE", "JavaScript", "HTML/CSS", "SQL", "Processing.js", "jQuery"],
      assignments: [
        "Animated Drawing Project",
        "Interactive Quiz Game",
        "Personal Webpage",
        "Data Visualization",
        "Memory Game",
        "Final Capstone Project"
      ]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter data based on search query
  const filteredSkills = useMemo(() => {
    if (!searchQuery) return trendingSkills;
    return trendingSkills.filter(skill => 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredCertifications = useMemo(() => {
    if (!searchQuery) return examCertifications;
    return examCertifications.filter(cert => 
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredPaths = useMemo(() => {
    if (!searchQuery) return learningPaths;
    return learningPaths.filter(path => 
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const handleCategoryClick = (categoryName: string) => {
    setSearchQuery(categoryName);
    toast({
      title: "Filter Applied",
      description: `Showing results for ${categoryName}`,
    });
  };

  const handleStartLearning = (skillName: string, link?: string) => {
    if (link) {
      window.open(link, '_blank');
      toast({
        title: "Opening Course",
        description: `Opening ${skillName} in new tab...`,
      });
    } else {
      toast({
        title: "Course Started",
        description: `Welcome to ${skillName}! Happy learning!`,
      });
    }
  };

  const handleViewDetails = (item: any, type: 'skill' | 'certification' | 'path') => {
    setSelectedItem(item);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  const handleStartFromModal = () => {
    if (selectedItem?.link) {
      window.open(selectedItem.link, '_blank');
      toast({
        title: "Opening Course",
        description: `Opening ${selectedItem.name || selectedItem.title} in new tab...`,
      });
    }
    handleCloseModal();
  };

  const handleBookmark = (itemName: string) => {
    toast({
      title: "Bookmarked",
      description: `${itemName} added to your saved items`,
    });
  };

  const handleStartPath = (pathTitle: string, link?: string) => {
    if (link) {
      window.open(link, '_blank');
      toast({
        title: "Opening Learning Path",
        description: `Opening ${pathTitle} in new tab...`,
      });
    } else {
      toast({
        title: "Learning Path Started",
        description: `Welcome to ${pathTitle}! Your journey begins now.`,
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">
            Explore{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Trending Content
            </span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover trending skills, popular technologies, and what's hot in the learning community
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6 md:mb-8 shadow-card">
          <CardContent className="p-4 md:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search skills, technologies, or certifications..."
                className="pl-10 h-10 md:h-12 text-base md:text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="mb-6 md:mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <TrendingUp className="h-5 w-5" />
              <span>Popular Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card 
                    key={index} 
                    className="p-3 md:p-4 text-center hover:shadow-elevated transition-all duration-300 cursor-pointer"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3`}>
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-xs md:text-sm mb-1 break-words">{category.name}</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground">{category.count} resources</p>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="skills" className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="flex w-max md:w-full md:grid md:grid-cols-3 gap-2 md:gap-0">
              <TabsTrigger value="skills" className="whitespace-nowrap">🔥 Trending Skills</TabsTrigger>
              <TabsTrigger value="certifications" className="whitespace-nowrap">🏆 Popular Certifications</TabsTrigger>
              <TabsTrigger value="paths" className="whitespace-nowrap">🚀 Hot Learning Paths</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="skills" className="space-y-6">
            {searchQuery && (
              <div className="text-center text-muted-foreground mb-4">
                Showing {filteredSkills.length} results for "{searchQuery}"
                {searchQuery && (
                  <Button 
                    variant="link" 
                    className="ml-2 p-0 h-auto"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map((skill, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{skill.name}</h3>
                        <Badge variant="outline" className="text-xs mb-2">
                          {skill.category}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      </div>
                      <div className="flex flex-col space-y-1 ml-2">
                        {skill.trending && (
                          <Badge className="bg-red-500 text-white text-xs">
                            🔥 Trending
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleBookmark(skill.name)}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{skill.learners} learners</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{skill.rating}</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <Badge className={getDifficultyColor(skill.difficulty)}>
                          {skill.difficulty}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(skill, 'skill')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleStartLearning(skill.name, skill.link)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredSkills.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                No skills found matching "{searchQuery}". Try a different search term.
              </div>
            )}
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            {searchQuery && (
              <div className="text-center text-muted-foreground mb-4">
                Showing {filteredCertifications.length} results for "{searchQuery}"
                {searchQuery && (
                  <Button 
                    variant="link" 
                    className="ml-2 p-0 h-auto"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCertifications.map((cert, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{cert.name}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{cert.provider}</p>
                          <p className="text-sm text-muted-foreground">{cert.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleBookmark(cert.name)}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Difficulty</p>
                          <Badge className={getDifficultyColor(cert.difficulty)}>
                            {cert.difficulty}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Passing Score</p>
                          <p className="font-semibold">{cert.passingScore}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-semibold">{cert.duration}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-semibold">{cert.cost}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Avg Salary</p>
                          <p className="font-semibold text-success">{cert.avgSalary}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Next Exam</p>
                          <p className="font-semibold">{cert.nextExam}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1"
                          onClick={() => handleViewDetails(cert, 'certification')}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleStartLearning(`${cert.name} preparation`, cert.link)}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Study Path
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredCertifications.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                No certifications found matching "{searchQuery}". Try a different search term.
              </div>
            )}
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            {searchQuery && (
              <div className="text-center text-muted-foreground mb-4">
                Showing {filteredPaths.length} results for "{searchQuery}"
                {searchQuery && (
                  <Button 
                    variant="link" 
                    className="ml-2 p-0 h-auto"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            )}
            <div className="space-y-6">
              {filteredPaths.map((path, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-xl mb-2">{path.title}</h3>
                            <p className="text-muted-foreground mb-3">{path.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleBookmark(path.title)}
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {path.skills.map((skill, skillIndex) => (
                            <Badge 
                              key={skillIndex} 
                              variant="secondary"
                              className="cursor-pointer hover:bg-secondary/80"
                              onClick={() => setSearchQuery(skill)}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{path.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{path.students} students</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{path.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{path.projects} projects</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-muted-foreground text-sm mb-1">Level</p>
                            <Badge className={getDifficultyColor(path.level.split(' ')[0])}>
                              {path.level}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm mb-1">Price</p>
                            <p className="font-semibold text-lg">{path.price}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button 
                            className="w-full"
                            onClick={() => handleStartPath(path.title, path.link)}
                          >
                            Start Path
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleViewDetails(path, 'path')}
                          >
                            View Curriculum
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredPaths.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                No learning paths found matching "{searchQuery}". Try a different search term.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DetailsModal
          isOpen={modalType !== null}
          onClose={handleCloseModal}
          type={modalType || 'skill'}
          data={selectedItem}
          onStart={handleStartFromModal}
        />
      </div>
    </Layout>
  );
};

export default Explore;