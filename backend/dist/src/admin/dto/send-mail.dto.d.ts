export declare enum TargetRole {
    ALL = "ALL",
    CLIENT = "CLIENT",
    FREELANCER = "FREELANCER"
}
export declare class SendMailDto {
    targetRole: TargetRole;
    subject: string;
    message: string;
}
