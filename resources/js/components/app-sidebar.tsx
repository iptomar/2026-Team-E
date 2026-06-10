import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ClipboardCheck, FileText, FolderGit2, GitBranch, LayoutGrid, Shield } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, builder, formsList, workflow } from '@/routes';
import type { NavItem } from '@/types';
import type { UserRole } from '@/types/auth';

const getHomePath = (role?: UserRole) =>
    role === 'administrador' ? '/admin-panel' : '/forms-list';

const getMainNavItems = (role?: UserRole): NavItem[] => {
    if (role === 'administrador') {
        return [
            {
                title: 'Administração',
                href: '/admin-panel',
                icon: Shield,
            },
            {
                title: 'Templates',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Canvas',
                href: builder(),
                icon: LayoutGrid,
            },
            {
                title: 'Workflows',
                href: workflow(),
                icon: GitBranch,
            },
            {
                title: 'Formulários',
                href: formsList(),
                icon: FileText,
            },
        ];
    }

    if (role === 'validador') {
        return [
            {
                title: 'Formulários',
                href: formsList(),
                icon: FileText,
            },
            {
                title: 'Aprovações',
                href: '/workflow-approvals',
                icon: ClipboardCheck,
            },
        ];
    }

    return [
        {
            title: 'Formulários',
            href: formsList(),
            icon: FileText,
        },
    ];
};

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user?.role;
    const mainNavItems = getMainNavItems(role);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={getHomePath(role)} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
