import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// 첫 화면 (지금은 배포 확인용 임시 화면)
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-16">
      <Badge variant="secondary">19팀 · 준비 중</Badge>
      <h1 className="text-3xl font-bold tracking-tight">뉴스 편향도 분석</h1>
      <p className="text-muted-foreground">
        같은 이슈를 다룬 기사를 언론사별로 모아 보고, 기사마다 어떤 목소리를 담고 무엇이 빠졌는지 비교합니다.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>배포 확인</CardTitle>
          <CardDescription>이 화면이 보이면 프론트엔드 기본 설정과 배포가 정상입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled>이슈 목록 (곧 추가)</Button>
        </CardContent>
      </Card>
    </main>
  );
}
