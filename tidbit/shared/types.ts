// Types shared by the API server and the React client.

export type ContentType = "video" | "quick_read" | "explainer" | "infographic" | "breaking";
export type ClaimType = "reporting" | "analysis" | "opinion" | "unconfirmed";
export type Tone = "positive" | "neutral" | "distressing";
export type FeedTab = "foryou" | "following" | "trending" | "local";
export type TrendScope = "local" | "national" | "global";
export type AccountType = "reader" | "publisher" | "admin";

export interface Slide {
  title: string;
  body: string;
  stat?: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartData {
  kind: "bar" | "donut" | "stat";
  title: string;
  unit?: string;
  points: ChartPoint[];
  note?: string;
}

export interface MotionScene {
  kicker?: string;
  text: string;
  stat?: string;
  duration: number; // seconds
}

export interface BreakingUpdate {
  minutesAgo: number;
  text: string;
  confirmed: boolean;
}

export interface PostMedia {
  scenes?: MotionScene[];
  videoUrl?: string;
  slides?: Slide[];
  chart?: ChartData;
  updates?: BreakingUpdate[];
  keyPoints?: string[];
}

export interface PublisherLite {
  id: number;
  handle: string;
  name: string;
  logoText: string;
  logoColor: string;
  verified: boolean;
  isDemo: boolean;
  following: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
  pct: number;
}

export interface Poll {
  id: number;
  postId: number;
  question: string;
  context: string;
  type: "single" | "multiple" | "yes_no" | "scale";
  placement: "embedded" | "end_of_video" | "after_slides" | "action_bar";
  status: "open" | "closed";
  closesAt: string | null;
  verifiedOnly: boolean;
  totalVotes: number;
  myVotes: number[];
  showResults: boolean;
  options: PollOption[];
}

export interface Post {
  id: number;
  headline: string;
  summary: string;
  contentType: ContentType;
  media: PostMedia;
  originalArticleUrl: string;
  category: Pick<Category, "id" | "name" | "slug">;
  storyGroupId: number | null;
  relatedCount: number;
  country: string;
  region: string;
  city: string;
  scope: TrendScope;
  tags: string[];
  sources: string[];
  claimType: ClaimType;
  tone: Tone;
  isDemo: boolean;
  correctionNotice: string | null;
  publishedAt: string;
  updatedAt: string;
  publisher: PublisherLite;
  counts: { likes: number; comments: number; shares: number; saves: number; views: number; reposts: number };
  viewer: { liked: boolean; saved: boolean; reposted: boolean };
  poll: { id: number; voted: boolean; placement: Poll["placement"] } | null;
  repostedBy?: { username: string; displayName: string; commentary: string } | null;
  reasons?: string[];
}

export interface PrivacySettings {
  privateProfile: boolean;
  likesPublic: boolean;
  followingPublic: boolean;
  repostsPublic: boolean;
  personalization: boolean;
}

export interface FeedSettings {
  autoplay: boolean;
  captions: boolean;
  defaultTab: FeedTab;
  reduceDistressing: boolean;
  dataSaver: boolean;
}

export interface NotificationSettings {
  breaking: boolean;
  publisherUpdates: boolean;
  social: boolean;
  pollResults: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface Me {
  id: number;
  username: string;
  displayName: string;
  email: string;
  profilePhoto: string | null;
  bio: string;
  website: string;
  accountType: AccountType;
  country: string;
  region: string;
  city: string;
  extraLocations: string[];
  interests: number[];
  preferences: string[];
  privacy: PrivacySettings;
  feed: FeedSettings;
  notifications: NotificationSettings;
  onboarded: boolean;
  unreadNotifications: number;
  publisherHandle: string | null;
}

export interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  profilePhoto: string | null;
  bio: string;
  website: string;
  location: string;
  interests: string[];
  followers: number;
  following: number;
  likesReceived: number;
  isMe: boolean;
  iFollow: boolean;
  isPrivate: boolean;
  canSeeContent: boolean;
  likesVisible: boolean;
  isDemo: boolean;
  blocked: boolean;
  muted: boolean;
  publisherHandle: string | null;
}

export interface CommentItem {
  id: number;
  postId: number;
  parentId: number | null;
  text: string;
  createdAt: string;
  likes: number;
  likedByMe: boolean;
  isMine: boolean;
  removed: boolean;
  author: { id: number; username: string; displayName: string; profilePhoto: string | null; publisherName: string | null; publisherHandle: string | null };
  replies: CommentItem[];
}

export interface NotificationItem {
  id: number;
  type: string;
  text: string;
  postId: number | null;
  actorUsername: string | null;
  isRead: boolean;
  createdAt: string;
}

export const DEFAULT_PRIVACY: PrivacySettings = {
  privateProfile: false,
  likesPublic: false,
  followingPublic: true,
  repostsPublic: true,
  personalization: true,
};

export const DEFAULT_FEED: FeedSettings = {
  autoplay: true,
  captions: true,
  defaultTab: "foryou",
  reduceDistressing: false,
  dataSaver: false,
};

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  breaking: true,
  publisherUpdates: true,
  social: true,
  pollResults: true,
  quietHoursStart: "",
  quietHoursEnd: "",
};

export const PREFERENCE_OPTIONS = [
  { id: "breaking", label: "Breaking news" },
  { id: "videos", label: "Short videos" },
  { id: "summaries", label: "Quick summaries" },
  { id: "explainers", label: "In-depth explainers" },
  { id: "local", label: "Local updates" },
  { id: "perspectives", label: "Multiple perspectives" },
  { id: "markets", label: "Business and markets" },
  { id: "positive", label: "Light and positive news" },
] as const;

/** MVP ranking weights for the For You feed. Configurable starting values, not a final algorithm. */
export const RANKING_WEIGHTS = {
  interest: 0.25,
  engagement: 0.15,
  freshness: 0.15,
  credibility: 0.15,
  follow: 0.1,
  geography: 0.1,
  diversity: 0.1,
} as const;
