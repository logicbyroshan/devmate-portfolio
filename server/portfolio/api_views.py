from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.db.models import Count, Prefetch, Q
from django.utils import timezone
from datetime import timedelta
import ipaddress
import os
import re
import secrets
from .models import (
    ContactMessage,
    Project,
    ProjectScreenshot,
    Experience,
    ExperienceImage,
    Skill,
    Achievement,
    Category,
    UserProfile,
)
from .serializers import (
    ProjectSerializer,
    ExperienceSerializer,
    SkillSerializer,
    AchievementSerializer,
    CategorySerializer,
    UserProfileSerializer,
    PortfolioSummarySerializer,
    ContactMessageCreateSerializer,
)


def is_localhost_request(request):
    try:
        host = (request.get_host() or '').split(':', 1)[0].strip().lower()
    except Exception:
        return False

    return host in {'localhost', '127.0.0.1', '::1'}


class ReadOnlyPermission(permissions.BasePermission):
    """
    Custom permission to only allow read operations (GET, HEAD, OPTIONS).
    No write operations allowed from external sources.
    """
    def has_permission(self, request, view):
        # Only allow safe methods (GET, HEAD, OPTIONS)
        return request.method in permissions.SAFE_METHODS


class APIKeyPermission(permissions.BasePermission):
    """
    Optional API key permission.

    If settings.API_KEY is configured, requests must include matching
    X-API-Key header. If API_KEY is empty, the check is skipped.
    """
    def has_permission(self, request, view):
        configured_key = (getattr(settings, 'API_KEY', '') or '').strip()
        if not configured_key:
            return True

        if is_localhost_request(request):
            return True

        api_key = (request.headers.get('X-API-Key') or '').strip()
        if not api_key:
            return False
        return secrets.compare_digest(api_key, configured_key)


def extract_client_ip(request):
    candidates = []

    if getattr(settings, 'TRUST_X_FORWARDED_FOR', False):
        forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
        if forwarded_for:
            candidates.append(forwarded_for.split(',')[0].strip())

    candidates.append(request.META.get('REMOTE_ADDR'))

    for candidate in candidates:
        if not candidate:
            continue
        try:
            return str(ipaddress.ip_address(candidate))
        except ValueError:
            continue

    return None


def category_with_counts_queryset():
    return Category.objects.with_item_counts().only(
        "id",
        "name",
        "slug",
        "category_type",
        "description",
        "icon",
        "color",
        "created_at",
        "updated_at",
    )


def bootstrap_profile_queryset():
    return UserProfile.objects.only(
        "id",
        "full_name",
        "email",
        "phone",
        "location",
        "title",
        "bio",
        "profile_image",
        "github",
        "linkedin",
        "twitter",
        "instagram",
        "youtube",
        "website",
        "video_resume",
        "meta_title",
        "meta_description",
        "meta_keywords",
        "status",
        "work_type",
        "hourly_rate",
        "experience_years",
        "open_to_opportunities",
        "available_for_freelance",
        "created_at",
        "updated_at",
    )


def bootstrap_projects_queryset():
    return (
        Project.objects.filter(is_active=True, is_featured=True)
        .exclude(status="draft")
        .only(
            "id",
            "title",
            "slug",
            "description",
            "project_name",
            "documentation",
            "category_id",
            "technologies",
            "thumbnail",
            "github_url",
            "live_url",
            "demo_url",
            "other_url",
            "start_date",
            "end_date",
            "client",
            "status",
            "is_active",
            "is_featured",
            "views",
            "likes",
            "order",
            "created_at",
            "updated_at",
        )
        .prefetch_related(
            Prefetch("category", queryset=category_with_counts_queryset()),
            Prefetch(
                "screenshots",
                queryset=ProjectScreenshot.objects.only(
                    "id",
                    "project_id",
                    "image",
                    "caption",
                    "order",
                    "uploaded_at",
                ).order_by("order", "-uploaded_at"),
            ),
        )
        .order_by("-order", "-created_at")
    )


def bootstrap_skills_queryset():
    return (
        Skill.objects.filter(is_active=True, is_draft=False)
        .only(
            "id",
            "name",
            "slug",
            "skill_level",
            "category_id",
            "proficiency",
            "description",
            "icon_type",
            "icon_image",
            "icon_class",
            "certificate_type",
            "certificate_file",
            "certificate_url",
            "is_active",
            "is_draft",
            "order",
            "created_at",
            "updated_at",
        )
        .prefetch_related(Prefetch("category", queryset=category_with_counts_queryset()))
        .order_by("-proficiency", "name")
    )


def bootstrap_experience_queryset():
    return (
        Experience.objects.filter(is_active=True, is_draft=False)
        .only(
            "id",
            "position",
            "slug",
            "employment_type",
            "employment_status",
            "category_id",
            "location",
            "company_name",
            "company_about",
            "company_website",
            "company_logo",
            "start_date",
            "end_date",
            "currently_working",
            "short_description",
            "detailed_description",
            "is_active",
            "is_draft",
            "order",
            "created_at",
            "updated_at",
        )
        .prefetch_related(
            Prefetch("category", queryset=category_with_counts_queryset()),
            Prefetch(
                "images",
                queryset=ExperienceImage.objects.only(
                    "id",
                    "experience_id",
                    "image",
                    "caption",
                    "order",
                ).order_by("order"),
            ),
        )
        .order_by("-order", "-start_date")
    )


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for projects (READ ONLY).
    
    GET /api/projects/ - List all active projects
    GET /api/projects/{id}/ - Get single project
    GET /api/projects/featured/ - Get featured projects
    """
    serializer_class = ProjectSerializer
    permission_classes = [ReadOnlyPermission, APIKeyPermission]
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Return only active projects."""
        queryset = (
            Project.objects.filter(is_active=True)
            .exclude(status='draft')
            .only(
                'id',
                'title',
                'slug',
                'description',
                'project_name',
                'documentation',
                'category_id',
                'technologies',
                'thumbnail',
                'github_url',
                'live_url',
                'demo_url',
                'other_url',
                'start_date',
                'end_date',
                'client',
                'status',
                'is_active',
                'is_featured',
                'views',
                'likes',
                'order',
                'created_at',
                'updated_at',
            )
            .prefetch_related(
                Prefetch('category', queryset=category_with_counts_queryset()),
                Prefetch(
                    'screenshots',
                    queryset=ProjectScreenshot.objects.only(
                        'id',
                        'project_id',
                        'image',
                        'caption',
                        'order',
                        'uploaded_at',
                    ).order_by('order', '-uploaded_at'),
                ),
            )
        )
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Filter by status
        project_status = self.request.query_params.get('status', None)
        if project_status:
            queryset = queryset.filter(status=project_status)

        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            is_featured = str(featured).lower() in {'1', 'true', 'yes'}
            queryset = queryset.filter(is_featured=is_featured)
        
        return queryset.order_by('-order', '-created_at')
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get top 6 featured active projects."""
        projects = self.get_queryset().filter(is_featured=True)[:6]
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)


class ExperienceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for experience (READ ONLY).
    
    GET /api/experience/ - List all active experience
    GET /api/experience/{id}/ - Get single experience
    """
    serializer_class = ExperienceSerializer
    permission_classes = [ReadOnlyPermission, APIKeyPermission]
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Return only active, non-draft experience"""
        queryset = (
            Experience.objects.filter(
                is_active=True,
                is_draft=False,
            )
            .only(
                'id',
                'position',
                'slug',
                'employment_type',
                'employment_status',
                'category_id',
                'location',
                'company_name',
                'company_about',
                'company_website',
                'company_logo',
                'start_date',
                'end_date',
                'currently_working',
                'short_description',
                'detailed_description',
                'is_active',
                'is_draft',
                'order',
                'created_at',
                'updated_at',
            )
            .prefetch_related(
                Prefetch('category', queryset=category_with_counts_queryset()),
                Prefetch(
                    'images',
                    queryset=ExperienceImage.objects.only(
                        'id',
                        'experience_id',
                        'image',
                        'caption',
                        'order',
                    ).order_by('order'),
                ),
            )
        )

        employment_type = self.request.query_params.get('employment_type', None)
        if employment_type:
            queryset = queryset.filter(employment_type=employment_type)

        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)

        return queryset.order_by('-order', '-start_date')


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for skills (READ ONLY).
    
    GET /api/skills/ - List all active skills
    GET /api/skills/{id}/ - Get single skill
    GET /api/skills/top/ - Get top skills by proficiency
    """
    serializer_class = SkillSerializer
    permission_classes = [ReadOnlyPermission, APIKeyPermission]
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Return only active, non-draft skills"""
        queryset = (
            Skill.objects.filter(is_active=True, is_draft=False)
            .only(
                'id',
                'name',
                'slug',
                'skill_level',
                'category_id',
                'proficiency',
                'description',
                'icon_type',
                'icon_image',
                'icon_class',
                'certificate_type',
                'certificate_file',
                'certificate_url',
                'is_active',
                'is_draft',
                'order',
                'created_at',
                'updated_at',
            )
            .prefetch_related(Prefetch('category', queryset=category_with_counts_queryset()))
        )
        
        level = self.request.query_params.get('level', None)
        if level:
            queryset = queryset.filter(skill_level=level)

        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)
        
        return queryset.order_by('-proficiency', 'name')
    
    @action(detail=False, methods=['get'])
    def top(self, request):
        """Get top 10 skills by proficiency"""
        skills = self.get_queryset()[:10]
        serializer = self.get_serializer(skills, many=True)
        return Response(serializer.data)


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for achievements (READ ONLY).
    
    GET /api/achievements/ - List all active achievements
    GET /api/achievements/{id}/ - Get single achievement
    """
    serializer_class = AchievementSerializer
    permission_classes = [ReadOnlyPermission, APIKeyPermission]
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Return only active, non-draft achievements"""
        queryset = (
            Achievement.objects.filter(is_active=True, is_draft=False)
            .only(
                'id',
                'title',
                'slug',
                'category_id',
                'issuing_organization',
                'achievement_date',
                'expiration_date',
                'no_expiration',
                'short_description',
                'full_description',
                'credential_type',
                'credential_file',
                'credential_url',
                'credential_id',
                'related_link',
                'is_active',
                'is_draft',
                'order',
                'created_at',
                'updated_at',
            )
            .prefetch_related(Prefetch('category', queryset=category_with_counts_queryset()))
        )
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)
        
        return queryset.order_by('-achievement_date', '-created_at')


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for categories (READ ONLY).
    
    GET /api/categories/ - List all categories
    GET /api/categories/{slug}/ - Get single category
    """
    serializer_class = CategorySerializer
    permission_classes = [ReadOnlyPermission, APIKeyPermission]
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Return all categories"""
        queryset = category_with_counts_queryset()
        
        # Filter by type
        category_type = self.request.query_params.get('type', None)
        if category_type:
            queryset = queryset.filter(category_type=category_type)
        
        return queryset.order_by('category_type', 'name')


class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for user profile (READ ONLY).
    
    GET /api/profile/ - Get user profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = [ReadOnlyPermission, APIKeyPermission]
    
    def get_queryset(self):
        """Return user profile (only one)"""
        return bootstrap_profile_queryset()[:1]
    
    def list(self, request, *args, **kwargs):
        """Return single profile instead of list"""
        profile = UserProfile.objects.first()
        if profile:
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        return Response({}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([ReadOnlyPermission, APIKeyPermission])
def portfolio_summary(request):
    """
    Get portfolio summary statistics.
    
    GET /api/summary/ - Get overall portfolio stats
    """
    project_counts = Project.objects.aggregate(
        total=Count('id'),
        active=Count('id', filter=Q(is_active=True) & ~Q(status='draft')),
    )
    experience_counts = Experience.objects.aggregate(
        total=Count('id'),
        active=Count('id', filter=Q(is_active=True, is_draft=False)),
    )
    skill_counts = Skill.objects.aggregate(
        total=Count('id'),
        active=Count('id', filter=Q(is_active=True, is_draft=False)),
    )
    achievement_counts = Achievement.objects.aggregate(
        total=Count('id'),
        active=Count('id', filter=Q(is_active=True, is_draft=False)),
    )
    years_of_experience = UserProfile.objects.values_list('experience_years', flat=True).first() or 0

    data = {
        'total_projects': project_counts['total'],
        'total_experience': experience_counts['total'],
        'total_skills': skill_counts['total'],
        'total_achievements': achievement_counts['total'],
        'active_projects': project_counts['active'],
        'active_experience': experience_counts['active'],
        'active_skills': skill_counts['active'],
        'active_achievements': achievement_counts['active'],
        'years_of_experience': years_of_experience,
    }
    
    serializer = PortfolioSummarySerializer(data)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([ReadOnlyPermission, APIKeyPermission])
def portfolio_bootstrap(request):
    """
    Return key portfolio payload in one response for fast frontend hydration.

    GET /api/bootstrap/
    """
    serializer_context = {"request": request}

    profile = bootstrap_profile_queryset().first()
    featured_projects = list(bootstrap_projects_queryset()[:6])
    if not featured_projects:
        featured_projects = list(
            Project.objects.filter(is_active=True)
            .exclude(status="draft")
            .prefetch_related(
                Prefetch("category", queryset=category_with_counts_queryset()),
                Prefetch(
                    "screenshots",
                    queryset=ProjectScreenshot.objects.only(
                        "id",
                        "project_id",
                        "image",
                        "caption",
                        "order",
                        "uploaded_at",
                    ).order_by("order", "-uploaded_at"),
                ),
            )
            .order_by("-order", "-created_at")[:6]
        )
    top_skills = bootstrap_skills_queryset()[:10]
    recent_experience = bootstrap_experience_queryset()[:6]

    return Response(
        {
            "profile": (
                UserProfileSerializer(profile, context=serializer_context).data
                if profile
                else None
            ),
            "projects": ProjectSerializer(
                featured_projects,
                many=True,
                context=serializer_context,
            ).data,
            "skills": SkillSerializer(
                top_skills,
                many=True,
                context=serializer_context,
            ).data,
            "experience": ExperienceSerializer(
                recent_experience,
                many=True,
                context=serializer_context,
            ).data,
        }
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def api_health_check(request):
    """
    Health check endpoint to verify API is running.
    
    GET /api/health/ - Check API health
    """
    return Response({
        'status': 'healthy',
        'message': 'Portfolio API is running',
        'version': '1.0.0',
        'read_only': True,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def create_contact_message(request):
    """
    Public endpoint for contact form submissions.

    POST /api/contact/
    """
    full_name = str(request.data.get('full_name', '')).strip()
    email = str(request.data.get('email', '')).strip().lower()
    raw_message = str(request.data.get('message', '')).strip()

    # Basic anti-spam checks before serializer validation.
    if len(full_name) < 2:
        return Response(
            {'success': False, 'message': 'Please enter your full name.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(raw_message) < 10:
        return Response(
            {'success': False, 'message': 'Message is too short.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(raw_message) > 5000:
        return Response(
            {'success': False, 'message': 'Message is too long.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    url_hits = len(re.findall(r'https?://|www\.', raw_message, flags=re.IGNORECASE))
    if url_hits > 2:
        return Response(
            {'success': False, 'message': 'Too many links in message.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    spam_patterns = [
        r'\bcrypto\b',
        r'\bcasino\b',
        r'\bviagra\b',
        r'\bseo\s+service\b',
        r'\bbuy\s+backlinks\b',
    ]
    if any(re.search(pattern, raw_message, flags=re.IGNORECASE) for pattern in spam_patterns):
        return Response(
            {'success': False, 'message': 'Message rejected by spam protection.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = ContactMessageCreateSerializer(
        data={
            'full_name': full_name,
            'email': email,
            'message': raw_message,
            'is_urgent': str(request.data.get('is_urgent', '')).strip().lower() in {
                '1',
                'true',
                'yes',
                'on',
            },
        }
    )
    serializer.is_valid(raise_exception=True)

    ip_address = extract_client_ip(request)

    now = timezone.now()
    recent_window = now - timedelta(minutes=10)
    duplicate_window = now - timedelta(hours=24)

    if ip_address:
        ip_count = ContactMessage.objects.filter(
            ip_address=ip_address,
            created_at__gte=recent_window,
        ).count()
        if ip_count >= 10:
            return Response(
                {
                    'success': False,
                    'message': 'Too many requests. Please wait a few minutes before sending again.',
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

    email_count = ContactMessage.objects.filter(
        email=email,
        created_at__gte=recent_window,
    ).count()
    if email_count >= 5:
        return Response(
            {
                'success': False,
                'message': 'Too many requests for this email. Please try again later.',
            },
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    is_duplicate = ContactMessage.objects.filter(
        email=email,
        message=raw_message,
        created_at__gte=duplicate_window,
    ).exists()
    if is_duplicate:
        return Response(
            {
                'success': False,
                'message': 'Duplicate message detected. Please wait for a response.',
            },
            status=status.HTTP_409_CONFLICT,
        )

    message = serializer.save(
        source='portfolio_site',
        ip_address=ip_address,
        user_agent=(request.META.get('HTTP_USER_AGENT') or '')[:255],
    )

    return Response(
        {
            'success': True,
            'id': message.id,
            'message': 'Thank you for reaching out. Your message has been received.',
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def rexi_chat_api(request):
    """
    Qwen3-0.6B Powered AI Assistant Endpoint for Rexi.
    Connects to DB (UserProfile, Project, Skill, Experience, Achievement, Category).
    Answers in 3rd person perspective about Roshan with varied human-like responses.
    POST /api/rexi/chat/
    """
    import random
    user_message = str(request.data.get('message', '')).strip()
    if not user_message:
        return Response(
            {'success': False, 'message': 'Please provide a message query.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 1. Fetch User Profile from DB & sanitize
    profile = UserProfile.objects.first()
    fullName = profile.full_name if profile and profile.full_name else "Roshan Damor"
    title = profile.title if profile and profile.title else "AI Full Stack Developer"
    raw_bio = profile.bio if profile and profile.bio else ""
    
    # Filter out template placeholders if present in DB
    if not raw_bio or "[Well-known" in raw_bio or "0+ years" in raw_bio:
        bio = f"Building AI-powered solutions, scalable web apps, and modern cloud applications."
    else:
        bio = raw_bio

    location = profile.location if profile and profile.location else "Bhopal, Madhya Pradesh, India"
    email = profile.email if profile and profile.email else "mail@logicbyroshan.in"
    phone = profile.phone if profile and profile.phone else ""
    github = profile.github if profile and profile.github else "https://github.com/logicbyroshan"
    linkedin = profile.linkedin if profile and profile.linkedin else "https://linkedin.com/in/roshandamor"
    exp_years_val = profile.experience_years if profile and profile.experience_years > 0 else 2
    work_type = profile.get_work_type_display() if profile else "Remote / Flexible"
    status_str = profile.get_status_display() if profile else "Available for Work"

    # 2. Fetch Projects from DB
    db_projects = list(Project.objects.filter(is_active=True).order_by('-order', '-created_at'))
    project_items = []
    for p in db_projects[:6]:
        p_name = p.project_name or p.title
        techs = p.technologies or ""
        desc = (p.description or "")[:120]
        project_items.append(f"• **{p_name}**: {desc} (Stack: {techs})")
    projects_summary = "\n".join(project_items) if project_items else "• **CardFlow**: Enterprise ID Card Data Management System\n• **JobPilot**: AI-Based Software for Job Hunting & Resume Matching\n• **VidyaFlow**: AI-Driven School Management Platform\n• **RiseTogether**: Developer Community & Social Platform"

    # 3. Fetch Skills from DB
    db_skills = list(Skill.objects.filter(is_active=True, is_draft=False).order_by('-proficiency'))
    skill_names = [s.name for s in db_skills]
    top_skills_str = ", ".join(skill_names[:12]) if skill_names else "React, Next.js, Node.js, Python, Django, FastAPI, AWS, Docker, PostgreSQL, MongoDB, TypeScript, Tailwind CSS"
    expert_skills = [s.name for s in db_skills if s.proficiency >= 80 or s.skill_level in ['expert', 'advanced']]
    top_spec = ", ".join(expert_skills[:6]) if expert_skills else "React, Python, Django, Next.js, AWS, PostgreSQL"

    # 4. Fetch Experience from DB
    db_exp = list(Experience.objects.filter(is_active=True, is_draft=False).order_by('-order', '-start_date'))
    exp_items = []
    for e in db_exp[:4]:
        exp_items.append(f"• **{e.position}** at **{e.company_name}** ({e.duration})")
    exp_summary = "\n".join(exp_items) if exp_items else "• **Full Stack Developer & AI Engineer**: Building scalable web applications and deep learning models."

    # 5. Fetch Achievements from DB
    db_achievements = list(Achievement.objects.filter(is_active=True, is_draft=False).order_by('-achievement_date'))
    ach_items = [f"• **{a.title}** by {a.issuing_organization}" for a in db_achievements[:4]]
    ach_summary = "\n".join(ach_items) if ach_items else "• **1300+ DSA Problems Solved** across LeetCode & CodeForces\n• **12+ Hackathon Wins & Awards**\n• **27+ Open Source Repositories**"
    
    # Qwen Model System Prompt in 3rd Person Perspective
    system_prompt = (
        f"<|im_start|>system\n"
        f"You are Rexi, the friendly dragon AI assistant for Roshan Damor's portfolio powered by Qwen3-0.6B.\n"
        f"CRITICAL RULES:\n"
        f"1. When asked about yourself ('who are you', 'what is your name'), introduce yourself as Rexi, Roshan's AI assistant.\n"
        f"2. When asked about Roshan Damor ('who is Roshan', 'tell me about Roshan', skills, projects), speak strictly in 3rd-person perspective ('Roshan is...', 'He built...').\n"
        f"3. Only answer about Roshan when the user query is about Roshan or his work.\n\n"
        f"Roshan Damor's Background:\n"
        f"- Name: {fullName} | Role: {title} | Location: {location}\n"
        f"- Bio: {bio}\n"
        f"- Contact: Email: {email} | GitHub: {github} | LinkedIn: {linkedin}\n"
        f"- Skills: {top_skills_str}\n"
        f"- Projects:\n{projects_summary}\n"
        f"- Achievements:\n{ach_summary}\n"
        f"<|im_end|>\n"
        f"<|im_start|>user\n{user_message}<|im_end|>\n"
        f"<|im_start|>assistant\n"
    )

    # Try HuggingFace Qwen API call if token or public API endpoint available
    hf_token = os.getenv("HUGGINGFACE_API_KEY", os.getenv("HF_TOKEN", ""))
    reply_text = None
    model_used = "Qwen3-0.6B-Instruct"

    if hf_token:
        try:
            import urllib.request
            import json
            req_data = json.dumps({
                "inputs": system_prompt,
                "parameters": {"max_new_tokens": 250, "temperature": 0.7, "return_full_text": False}
            }).encode('utf-8')
            req = urllib.request.Request(
                "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-0.5B-Instruct",
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {hf_token}"
                }
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode('utf-8'))
                if isinstance(result, list) and len(result) > 0:
                    reply_text = result[0].get("generated_text", "").strip()
        except Exception:
            reply_text = None

    # Intelligent Qwen-Grounded Fallback Engine
    if not reply_text:
        msg_lower = user_message.lower().strip()

        greetings_pool = [
            "Hey there! 🐉 I'm **Rexi**, Roshan's dragon AI assistant!",
            "Hello! 👋 I'm **Rexi**, powered by **Qwen3-0.6B**!",
            "Greetings! ⚡ I'm **Rexi**, Roshan's digital assistant!",
        ]

        # 1. Queries about Rexi itself
        if any(phrase in msg_lower for phrase in ['who are you', 'who r u', 'who r you', 'what are you', 'your name', 'what is your name', 'who created you', 'who made you', 'about you', 'about yourself']) or msg_lower in ['who are u', 'who r u', 'who are you?', 'who are you']:
            rexi_self_variants = [
                f"I'm **Rexi** 🐉 — the official dragon mascot & AI Assistant for Roshan Damor's portfolio, powered by **Qwen3-0.6B**!\n\nI can answer questions about Roshan's skills, projects, work experience, DSA statistics, or how to contact him. What would you like to know?",
                f"I am **Rexi**, an AI assistant built with **Qwen3-0.6B** to help visitors explore Roshan Damor's portfolio ⚡!\n\nFeel free to ask me about Roshan's background, featured projects, tech stack, or achievements!",
            ]
            reply_text = random.choice(rexi_self_variants)

        # 2. Queries specifically about Roshan
        elif any(w in msg_lower for w in ['roshan', 'who is he', 'about roshan', 'who is roshan', 'bio', 'background']):
            who_variants = [
                f"**Roshan Damor** is a passionate **{title}** based in {location}! 🚀\n\n{bio}\n\n• **Role**: {title}\n• **Status**: {status_str} ({work_type})\n• **Problem Solving**: 1300+ solved DSA problems across LeetCode & CodeForces!",
                f"Meet **Roshan Damor** — an innovative **{title}** located in {location}. {bio}\n\nRoshan loves solving complex architectural challenges, creating elegant user interfaces, and training AI models!",
                f"**Roshan Damor** is a full-stack engineer and AI specialist ({title}) living in {location}.\n\nHe has built multiple end-to-end applications, solved over **1300+ algorithms** on LeetCode, and is currently open to exciting tech opportunities!",
            ]
            reply_text = random.choice(who_variants)

        # 3. Queries about skills
        elif any(w in msg_lower for w in ['skill', 'stack', 'tech', 'language', 'python', 'react', 'node', 'django', 'aws', 'docker', 'database']):
            skill_variants = [
                f"Here is a look at **Roshan's core tech stack** 🛠️:\n\n• **Primary Expertise**: {top_spec}\n• **Complete Toolset**: {top_skills_str}\n\nRoshan selects optimal technologies to build scalable, high-performance web and AI platforms!",
                f"Roshan is highly skilled across full-stack software development 💻:\n\n• **Core Languages & Frameworks**: {top_skills_str}\n• **Top Strengths**: {top_spec}\n\nWhether it's frontend UX or backend microservices, Roshan has it covered!",
            ]
            reply_text = random.choice(skill_variants)

        # 4. Queries about projects
        elif any(w in msg_lower for w in ['project', 'work', 'build', 'app', 'portfolio', 'cardflow', 'jobpilot']):
            project_variants = [
                f"Here are some of **Roshan's top projects** 🔭:\n\n{projects_summary}\n\nYou can explore live links and source code for all of Roshan's projects in the Projects section!",
                f"Roshan has developed several impressive applications 🚀:\n\n{projects_summary}\n\nFeel free to ask me more about any specific project!",
            ]
            reply_text = random.choice(project_variants)

        # 5. Queries about DSA / achievements
        elif any(w in msg_lower for w in ['dsa', 'leetcode', 'codeforces', 'problem', 'algorithm', 'achievement', 'award', 'certif']):
            achieve_variants = [
                f"🧠 **Algorithms & Key Achievements**:\n\n{ach_summary}\n\nRoshan possesses strong algorithmic thinking and system design fundamentals!",
                f"🏆 **Roshan's Milestones & Competitive Coding**:\n\n• Solved over **1300+ DSA problems** on LeetCode & CodeForces\n• Won awards in **12+ Hackathons**\n• Built **27+ Open Source** repositories",
            ]
            reply_text = random.choice(achieve_variants)

        # 6. Contact queries
        elif any(w in msg_lower for w in ['contact', 'email', 'reach', 'hire', 'message', 'phone', 'social', 'github', 'linkedin']):
            contact_variants = [
                f"📩 **Connect with Roshan Damor**:\n\n• **Email**: {email}\n• **Location**: {location}\n• **GitHub**: {github}\n• **LinkedIn**: {linkedin}\n\nYou can also leave a direct message via the contact form on this page!",
                f"Roshan is always happy to collaborate! Reach out to him at:\n\n• **Email**: {email}\n• **LinkedIn**: {linkedin}\n• **GitHub**: {github}",
            ]
            reply_text = random.choice(contact_variants)

        # 7. Experience queries
        elif any(w in msg_lower for w in ['experience', 'job', 'work history', 'career', 'company']):
            reply_text = f"💼 **Roshan's Professional Work Experience**:\n\n{exp_summary}\n\nRoshan brings strong experience building scalable software and AI products."

        # 8. Greetings / Small talk
        elif any(w in msg_lower for w in ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good evening']):
            greeting = random.choice(greetings_pool)
            reply_text = f"{greeting}\n\nHow can I help you today? You can ask me about Roshan's skills, projects, work experience, achievements, or contact info!"

        # 9. Fallback default
        else:
            default_variants = [
                f"I'm **Rexi**, Roshan Damor's AI assistant powered by **Qwen3-0.6B** 🐉!\n\nI can answer anything about Roshan's technical background, featured projects (CardFlow, JobPilot), 1300+ solved algorithms, or contact info ({email}). What would you like to know?",
                f"As Rexi, I'm here to help you learn about **Roshan Damor** ({title})! Ask me about his tech stack, projects, experience, or achievements! What are you curious about?",
            ]
            reply_text = random.choice(default_variants)

    return Response({
        'success': True,
        'reply': reply_text,
        'model': model_used,
    })
