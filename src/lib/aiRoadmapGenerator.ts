import { Database } from "@/integrations/supabase/types";

type RoadmapGenerationPrompt = {
  title: string;
  description: string;
  skillLevel: string;
  timeCommitment: string;
  targetRole?: string;
  preferredLearningStyle?: string;
  focusAreas: string[];
  deadline?: string;
  recommendedResources?: any[];
  useRecommendedResources?: boolean;
};

export const generateAIPrompt = (params: RoadmapGenerationPrompt): string => {
  const { title, description, skillLevel, timeCommitment, targetRole, preferredLearningStyle, focusAreas, deadline, recommendedResources, useRecommendedResources } = params;

  let aiPrompt = `Generate a detailed learning roadmap for "${title}".\n\n`;
  aiPrompt += `Objective: ${description}.\n`;
  aiPrompt += `Current Skill Level: ${skillLevel}.\n`;
  aiPrompt += `Weekly Time Commitment: ${timeCommitment}.\n`;
  if (targetRole) {
    aiPrompt += `Target Role/Position: ${targetRole}.\n`;
  }
  if (preferredLearningStyle) {
    aiPrompt += `Preferred Learning Style: ${preferredLearningStyle}.\n`;
  }
  if (focusAreas.length > 0) {
    aiPrompt += `Key Focus Areas: ${focusAreas.join(', ')}.\n`;
  }
  if (deadline) {
    aiPrompt += `Target Completion Date: ${deadline}.\n`;
  }

  if (useRecommendedResources && recommendedResources && recommendedResources.length > 0) {
    aiPrompt += `\nConsider integrating the following recommended resources:\n`;
    recommendedResources.forEach((res, index) => {
      aiPrompt += `${index + 1}. ${res.title} (${res.type}): ${res.url}\n`;
    });
  }

  aiPrompt += `\nStructure the roadmap into phases (e.g., Beginner, Intermediate, Advanced), with detailed modules and sub-modules within each phase. Suggest specific learning activities or resources for each module.`;

  return aiPrompt;
};

export const callAIGenerator = async (prompt: string): Promise<any> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    // Fallback to mock for development if AI API not set up
    console.warn("AI API key is not configured. Falling back to mock roadmap generation.");
    return generateMockRoadmap(prompt, [], false); // Use the mock function as fallback
  }

  // This is a placeholder for an actual AI API call.
  // You would replace this with a fetch request to your chosen AI service (e.g., Google Gemini, OpenAI).
  // The API call structure (endpoint, headers, body) will vary depending on the AI service.
  // Make sure the AI response can be parsed into the expected roadmap structure.
  console.log("Calling AI with prompt:", prompt);

  // Example using a hypothetical Gemini API endpoint
  // const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
  //   },
  //   body: JSON.stringify({
  //     contents: [{ parts: [{ text: prompt }] }],
  //   }),
  // });
  //
  // if (!response.ok) {
  //   const errorData = await response.json();
  //   throw new Error(`AI API error: ${errorData.error.message || response.statusText}`);
  // }
  //
  // const data = await response.json();
  // const aiGeneratedText = data.candidates[0].content.parts[0].text;
  //
  // // You might need to parse the AI's text response into a structured JSON object.
  // // This often involves instructing the AI to output JSON directly.
  // // For now, we'll simulate this parsing by using the mock generator with the full prompt.
  // const parsedAIResponse = JSON.parse(aiGeneratedText); // Assuming AI returns JSON
  // return parsedAIResponse;

  // Current mock fallback for demonstration
  return generateMockRoadmap(prompt, [], false);
};

// Mock AI response function (moved from CreateRoadmap.tsx)
export const generateMockRoadmap = (prompt: string, recommendedResources: any[], useRecommendedResources: boolean) => {
  const titleMatch = prompt.match(/Generate a detailed learning roadmap for "(.*?)"/);
  const title = titleMatch ? titleMatch[1] : 'Personalized Learning Roadmap';

  const descriptionMatch = prompt.match(/Objective: (.*?)\n/);
  const description = descriptionMatch ? descriptionMatch[1] : 'A comprehensive learning path tailored to your needs.';

  const estimatedDurationMatch = prompt.match(/Weekly Time Commitment: (.*?)\./);
  const rawEstimatedTime = estimatedDurationMatch ? estimatedDurationMatch[1] : '5-10 hours per week';
  let totalWeeks = 12; // Default total duration
  if (rawEstimatedTime.includes('2-5')) totalWeeks = 16; // Longer for less time commitment
  else if (rawEstimatedTime.includes('10-15')) totalWeeks = 8;
  else if (rawEstimatedTime.includes('15+')) totalWeeks = 6; // Shorter for high time commitment

  const skillLevelMatch = prompt.match(/Current Skill Level: (.*?)\./);
  const skillLevel = skillLevelMatch ? skillLevelMatch[1].toLowerCase() : 'beginner';

  const focusAreasMatch = prompt.match(/Key Focus Areas: (.*?)\./);
  const focusAreas = focusAreasMatch ? focusAreasMatch[1].split(', ').map(s => s.trim()) : [];

  // Roadmap Structure (Mold)
  const phases: any[] = [];
  let currentWeek = 1;

  // Introduction Phase
  phases.push({
    name: 'Introduction: Getting Started',
    description: `Embark on your journey to master ${title.replace(' Learning Roadmap', '')}. This phase will establish foundational knowledge tailored to your ${skillLevel} level.`,      duration: '1 week',
    resources: useRecommendedResources ? recommendedResources : [],
    topics: [
      `Understanding the basics of ${title.replace(' Learning Roadmap', '')}`,
      'Setting up your development environment (if applicable)',
      'Core concepts and terminology',
    ],
    task: 'Complete a "Hello World" equivalent project.',
  });
  currentWeek++;

  // Weekly/Phase Breakdown
  while (currentWeek <= totalWeeks) {
    let phaseName = '';
    let phaseDescription = '';
    let topics: string[] = [];
    let task = '';
    const phaseDuration = '1 week';

    if (currentWeek <= totalWeeks / 3) {
      phaseName = `Week ${currentWeek}: Fundamentals`;
      phaseDescription = 'Deep dive into foundational concepts and basic syntax.';
      topics = [
        `Fundamental concepts of ${title.replace(' Learning Roadmap', '')}`,
        'Basic data structures and algorithms (if applicable)',
        'Control flow and functions',
      ];
      if (focusAreas.length > 0) {
        topics.push(`Introduction to ${focusAreas[0]} concepts`);
      }
      task = 'Implement a simple calculator or data manipulation script.';
    } else if (currentWeek <= (totalWeeks * 2) / 3) {
      phaseName = `Week ${currentWeek}: Intermediate Concepts`;
      phaseDescription = 'Develop core skills with practical application and problem-solving.';
      topics = [
        'Object-Oriented Programming or advanced paradigms',
        'API integration or system interaction (if applicable)',
        'Error handling and debugging',
      ];
      if (focusAreas.length > 0) {
        topics.push(`Intermediate ${focusAreas[0]} techniques`);
      }
      task = 'Build a small web application or a data analysis pipeline.';
    } else {
      phaseName = `Week ${currentWeek}: Advanced Topics & Specialization`;
      phaseDescription = 'Master complex areas and explore specialized topics.';
      topics = [
        'Advanced design patterns or architectural principles',
        'Performance optimization and scaling',
        'Security best practices',
      ];
      if (focusAreas.length > 0) {
        topics.push(`Advanced ${focusAreas[0]} concepts and tools`);
        if (focusAreas.length > 1) topics.push(`Exploring ${focusAreas[1]} integration`);
      }
      task = 'Lead a significant feature development or a complex data science project.';
    }

    phases.push({
      name: phaseName,
      description: phaseDescription,
      duration: phaseDuration,
      topics: topics,
      task: task,
      resources: [], // Resources can be added dynamically here if needed beyond initial recommendations
    });

    // Milestones
    if (currentWeek % 4 === 0 && currentWeek < totalWeeks) {
      phases.push({
        name: `Milestone: End of Week ${currentWeek}`,
        description: `Key achievements: Demonstrated proficiency in core ${title.replace(' Learning Roadmap', '')} concepts, completed hands-on projects.`,          duration: 'N/A',
        type: 'milestone',
        topics: [
          'Skills gained: Core syntax, basic problem-solving',
          'Progress markers: Successfully completed several mini-projects',
        ],
      });
    }
    currentWeek++;
  }
  // Final Outcome
  phases.push({
    name: 'Final Outcome: Mastery Achieved',
    description: `Congratulations! You have completed your ${title.replace(' Learning Roadmap', '')} journey.`,      duration: 'N/A',
    type: 'final-outcome',
    topics: [
      `Skills: Mastered ${title.replace(' Learning Roadmap', '')}, including ${focusAreas.join(', ') || 'all key areas'}.`,
      'Certifications: Prepared for relevant industry certifications.',
      'Portfolio: Developed a strong portfolio with practical projects.',
      `Ready for ${descriptionMatch ? descriptionMatch[1].toLowerCase() : 'new challenges'}.`,
    ],
  });

  return {
    title: title,
    description: description,
    estimatedDuration: totalWeeks === 1 ? '1 week' : `${totalWeeks} weeks`,
    phases: phases,
  };
};

