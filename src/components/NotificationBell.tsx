import { Bell, CheckCheck, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { Link } from "react-router-dom";

const NotificationBell = () => {
  const { notifications, unreadCount, isLoading, markAllAsRead, markAsRead, deleteNotification, createTestNotification } = useNotifications();

  const getNotificationLink = (notification: any) => {
    if (notification.data?.roadmap_id) {
      return `/roadmaps/${notification.data.roadmap_id}`;
    }
    if (notification.data?.post_id) {
      // Assuming a route structure for posts
      return `/posts/${notification.data.post_id}`;
    }
    if (notification.data?.follower_id) {
      return `/profile/${notification.data.follower_id}`;
    }
    return '#';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 py-0 h-4 min-w-[16px] text-[10px] leading-4" variant="destructive">{unreadCount}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="px-3 py-2 flex items-center justify-between">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className="gap-1">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              You're all caught up.
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => createTestNotification()}>Create test notification</Button>
              </div>
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem key={n.id} asChild className={`border-b last:border-b-0 ${!n.read_at ? 'bg-accent/40' : ''}`}>
                <Link to={getNotificationLink(n)} className="block w-full">
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{n.title}</div>
                      {n.body && <div className="text-xs text-muted-foreground mt-0.5 whitespace-pre-line">{n.body}</div>}
                      <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!n.read_at && (
                        <Button size="icon" variant="ghost" onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsRead(n.id); }} aria-label="Mark as read">
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNotification(n.id); }} aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;


