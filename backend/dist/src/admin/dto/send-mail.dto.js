"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMailDto = exports.TargetRole = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var TargetRole;
(function (TargetRole) {
    TargetRole["ALL"] = "ALL";
    TargetRole["CLIENT"] = "CLIENT";
    TargetRole["FREELANCER"] = "FREELANCER";
})(TargetRole || (exports.TargetRole = TargetRole = {}));
class SendMailDto {
    targetRole;
    subject;
    message;
}
exports.SendMailDto = SendMailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Le public cible du mail', enum: TargetRole }),
    (0, class_validator_1.IsEnum)(TargetRole),
    __metadata("design:type", String)
], SendMailDto.prototype, "targetRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Le sujet de l\'e-mail' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendMailDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Le contenu de l\'e-mail' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendMailDto.prototype, "message", void 0);
//# sourceMappingURL=send-mail.dto.js.map