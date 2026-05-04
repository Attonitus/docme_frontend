export interface User {
    id:          string;
    name:        string;
    email:       string;
    avatarUrl:   null;
    createdAt:   Date;
    memberships: Membership[];
}

export interface Membership {
    id:           string;
    userId:       string;
    orgId:        string;
    role:         string;
    joinedAt:     Date;
    organization: Organization;
}

export interface Organization {
    id:   string;
    name: string;
    slug: string;
}