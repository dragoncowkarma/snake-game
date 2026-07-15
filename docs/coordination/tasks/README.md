# Offline task packet fallback

GitHub Issue를 사용할 수 없을 때만 `docs/TASKS.md`의 작업 패킷 YAML을 복사해 `<task-id>.yaml`로 저장한다. 파일에는 `spec_version`, `task_revision`, `approved_by`, `approved_at`, `base_sha`, 허용/금지 경로, AC, 검증 명령, 담당자, 리뷰어가 모두 있어야 한다.

GitHub Issue와 offline packet을 동시에 원본으로 사용하지 않는다. 조정 책임자가 packet revision을 승인하고 `STATUS.md`에 경로를 기록한 뒤에만 작업을 시작한다.
