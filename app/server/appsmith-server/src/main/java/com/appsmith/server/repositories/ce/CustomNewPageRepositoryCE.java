package com.appsmith.server.repositories.ce;

import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.domains.NewPage;
import com.appsmith.server.repositories.AppsmithRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface CustomNewPageRepositoryCE extends AppsmithRepository<NewPage> {

    Flux<NewPage> findByApplicationId(String applicationId, AclPermission aclPermission);

    Flux<NewPage> findByApplicationIdAndNonDeletedEditMode(String applicationId, AclPermission aclPermission);

    Mono<NewPage> findByIdAndLayoutsIdAndViewMode(
            String id, String layoutId, AclPermission aclPermission, Boolean viewMode);

    Mono<NewPage> findByNameAndViewMode(String name, AclPermission aclPermission, Boolean viewMode);

    Mono<NewPage> findByNameAndApplicationIdAndViewMode(
            String name, String applicationId, AclPermission aclPermission, Boolean viewMode);

    Flux<NewPage> findAllPageDTOsByIds(List<String> ids, AclPermission aclPermission);

    Mono<String> getNameByPageId(String pageId, boolean isPublishedName);

    Mono<NewPage> findPageByBranchNameAndDefaultPageId(
            String branchName, String defaultPageId, AclPermission permission);

    Mono<NewPage> findByGitSyncIdAndDefaultApplicationId(
            String defaultApplicationId, String gitSyncId, AclPermission permission);

    Mono<NewPage> findByGitSyncIdAndDefaultApplicationId(
            String defaultApplicationId, String gitSyncId, Optional<AclPermission> permission);

    Mono<Void> publishPages(Collection<String> pageIds, AclPermission permission);

    Flux<NewPage> findAllByApplicationIdsWithoutPermission(List<String> applicationIds, List<String> includeFields);

    Mono<String> findBranchedPageId(String branchName, String defaultPageId, AclPermission permission);

    Mono<Integer> updateDependencyMap(String pageId, Map<String, List<String>> dependencyMap);
}
