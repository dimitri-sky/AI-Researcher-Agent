import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const GEMINI_API_KEY = 'AIzaSyCpOPBS7oG0JrXaAn6TTI8gdx0Om67SO4A'; // Note: In production, use environment variables
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  }
});

// Mock data for development mode
const MOCK_LATEX = `\\begin{center}
\\textbf{\\Large Efficient Fine-Tuning of Large Language Models via Adaptive Low-Rank Decomposition}

\\vspace{0.3cm}

\\textbf{Jennifer Zhang}$^{1,*}$, \\textbf{Michael Chen}$^{1}$, \\textbf{Sarah Williams}$^{2}$, \\textbf{David Kumar}$^{1}$

\\vspace{0.2cm}

$^{1}$Department of Computer Science, Stanford University, Stanford, CA 94305

$^{2}$Institute for Artificial Intelligence, MIT, Cambridge, MA 02139

\\vspace{0.2cm}

$^{*}$Corresponding author: jzhang@cs.stanford.edu

\\vspace{0.2cm}

\\textit{Submitted: October 15, 2024 | Revised: November 3, 2024 | Accepted: November 18, 2024}
\\end{center}

\\vspace{0.4cm}

\\subsection*{Abstract}

Fine-tuning large language models (LLMs) for downstream tasks remains computationally expensive due to the massive number of parameters requiring optimization. We introduce \\textbf{AdaLoRA} (Adaptive Low-Rank Adaptation), a parameter-efficient fine-tuning method that dynamically allocates parameter budgets across weight matrices based on their importance to the task. Unlike existing low-rank adaptation methods that use uniform rank allocation, AdaLoRA employs singular value decomposition to prune less important singular values and focuses computational resources on critical model components. Our extensive experiments on natural language understanding, question answering, and natural language generation tasks demonstrate that AdaLoRA achieves comparable or superior performance to full fine-tuning while updating only 0.1-0.3% of the original parameters. On the GLUE benchmark, AdaLoRA matches RoBERTa-base full fine-tuning performance while being 12x more parameter-efficient than standard LoRA. Code and pretrained models are available at https://github.com/example/adalora.

\\textbf{Keywords:} Parameter-efficient fine-tuning, Low-rank adaptation, Large language models, Singular value decomposition, Neural architecture search, Transfer learning

\\section{Introduction}

The emergence of large language models (LLMs) with billions of parameters has revolutionized natural language processing. However, adapting these models to specific downstream tasks through full fine-tuning remains prohibitively expensive, requiring substantial computational resources and memory. Recent parameter-efficient fine-tuning (PEFT) methods, particularly Low-Rank Adaptation (LoRA) [Hu et al., 2021], address this by training low-rank decomposition matrices while keeping the pretrained weights frozen.

Despite LoRA's success, a critical limitation persists: it applies uniform rank allocation across all weight matrices, disregarding their varying importance for different tasks. Intuitively, attention layers and certain feed-forward components may require higher capacity for task-specific adaptation, while others need minimal modification.

We introduce \\textbf{AdaLoRA} (Adaptive Low-Rank Adaptation), which addresses this limitation through dynamic parameter budget allocation. Our key contributions are:

\\textbf{First}, we propose a novel importance scoring mechanism based on singular value decomposition that quantifies each weight matrix's contribution to task performance, enabling data-driven rank allocation.

\\textbf{Second}, we develop an adaptive pruning strategy that progressively reallocates parameters from less important to more critical components during training, optimizing the parameter budget distribution.

\\textbf{Third}, we demonstrate through extensive experiments on GLUE, SQuAD, and summarization tasks that AdaLoRA consistently outperforms uniform LoRA with the same parameter budget, achieving up to 2.3% improvement on average while using 40% fewer trainable parameters.

\\section{Related Work}

\\subsection{Parameter-Efficient Fine-Tuning}

Traditional fine-tuning updates all model parameters, making it memory-intensive for billion-parameter models. Adapter-based methods [Houlsby et al., 2019; Pfeiffer et al., 2020] insert trainable modules between transformer layers but increase inference latency. Prefix tuning [Li and Liang, 2021] prepends trainable vectors to each layer but struggles with optimization for larger models.

LoRA [Hu et al., 2021] decomposes weight updates as $\\Delta W = BA$, where $B \\in \\mathbb{R}^{d \\times r}$ and $A \\in \\mathbb{R}^{r \\times k}$ with rank $r \\ll \\min(d, k)$. This reduces trainable parameters from $d \\times k$ to $(d + k) \\times r$. However, LoRA uses uniform rank across all matrices, potentially wasting capacity on less important layers.

\\subsection{Neural Architecture Search and Pruning}

Our adaptive allocation strategy draws inspiration from neural architecture search (NAS) and network pruning. Magnitude-based pruning [Han et al., 2015] removes weights below a threshold, while structured pruning [Li et al., 2017] prunes entire channels or layers. Recent work on differentiable NAS [Liu et al., 2019] optimizes architecture and weights jointly.

AdaLoRA extends these ideas to parameter-efficient fine-tuning by treating rank allocation as a continuous optimization problem, dynamically adjusting capacity based on importance scores derived from singular value magnitudes.

\\section{Methodology}

\\subsection{Problem Formulation}

Given a pretrained language model with weight matrices $\\{W^{(i)} \\in \\mathbb{R}^{d_i \\times k_i}\\}_{i=1}^N$ and a downstream task with dataset $\\mathcal{D} = \\{(x_j, y_j)\\}_{j=1}^M$, our goal is to adapt the model by learning task-specific parameters while maintaining parameter efficiency. We parameterize the weight update for each matrix as:

$$W^{(i)} \\leftarrow W^{(i)} + \\Delta W^{(i)} = W^{(i)} + B^{(i)} \\Lambda^{(i)} A^{(i)}$$

where $B^{(i)} \\in \\mathbb{R}^{d_i \\times r_i}$, $\\Lambda^{(i)} \\in \\mathbb{R}^{r_i \\times r_i}$ is diagonal, $A^{(i)} \\in \\mathbb{R}^{r_i \\times k_i}$, and $r_i$ is the adaptive rank. The total parameter budget is constrained: $\\sum_{i=1}^N (d_i + k_i) r_i \\leq B$.

\\subsection{Singular Value Decomposition Parameterization}

Unlike standard LoRA, we parameterize updates using SVD-style decomposition with explicit singular values $\\Lambda^{(i)}$. This enables direct manipulation of component importance. During forward pass:

$$h = W^{(i)}x + B^{(i)} \\Lambda^{(i)} A^{(i)} x$$

The singular values in $\\Lambda^{(i)} = \\text{diag}(\\sigma_1^{(i)}, ..., \\sigma_{r_i}^{(i)})$ represent the importance of each rank-1 component.

\\subsection{Importance Scoring}

We define an importance score for each triplet $(B^{(i)}, \\Lambda^{(i)}, A^{(i)})$ based on the sensitivity of the loss function to removing that component. For the $k$-th singular value of matrix $i$:

$$\\mathcal{I}_k^{(i)} = \\sigma_k^{(i)} \\cdot \\left\\|\\frac{\\partial \\mathcal{L}}{\\partial \\Lambda_k^{(i)}}\\right\\|$$

This combines magnitude (how large is the component) with gradient information (how much does it affect task performance). High importance scores indicate components critical for the task.

\\subsection{Adaptive Rank Allocation}

We employ a gradual pruning schedule that removes low-importance singular values and reallocates parameters to high-importance matrices. At training step $t$, we:

1. Compute importance scores $\\{\\mathcal{I}_k^{(i)}\\}$ for all components
2. Determine pruning threshold $\\tau_t$ to maintain budget constraint
3. Prune components where $\\mathcal{I}_k^{(i)} < \\tau_t$
4. Reinitialize pruned dimensions with small random values to allow recovery

The pruning schedule follows a cubic function to allow initial exploration:

$$\\tau_t = \\tau_{\\text{final}} \\left(1 - \\left(1 - \\frac{t}{T}\\right)^3\\right)$$

where $T$ is total training steps and $\\tau_{\\text{final}}$ is determined by the target parameter budget.

\\section{Experimental Setup}

\\subsection{Datasets and Tasks}

We evaluate AdaLoRA on three categories of tasks:

\\textbf{Natural Language Understanding}: GLUE benchmark [Wang et al., 2018] including MNLI, SST-2, CoLA, QNLI, QQP, RTE, MRPC, and STS-B. We report average scores across all tasks.

\\textbf{Question Answering}: SQuAD v1.1 [Rajpurkar et al., 2016] and v2.0, measuring exact match (EM) and F1 scores.

\\textbf{Natural Language Generation}: CNN/DailyMail summarization [Hermann et al., 2015] using ROUGE scores.

\\subsection{Implementation Details}

We implement AdaLoRA in PyTorch with HuggingFace Transformers. Base models include RoBERTa-base (125M), RoBERTa-large (355M), and GPT-2-large (774M). Key hyperparameters:

- Initial rank: $r_0 = 8$ for all matrices
- Target parameter budget: 0.3% of original parameters
- Learning rate: $3 \\times 10^{-4}$ with linear warmup
- Batch size: 32 (GLUE), 12 (SQuAD), 8 (summarization)
- Optimizer: AdamW with weight decay $0.01$
- Pruning starts at 20% of training, completes at 80%
- Importance score moving average decay: $\\beta = 0.85$

We apply AdaLoRA to query and value projection matrices in all attention layers, which typically yields best performance-efficiency tradeoffs.

\\section{Results}

\\subsection{Main Results}

Table 1 shows AdaLoRA's performance compared to baselines. On GLUE, AdaLoRA achieves 88.4% average score with only 0.3% trainable parameters, matching RoBERTa-base full fine-tuning (88.3%) while being 12x more parameter-efficient than standard LoRA (3.5% parameters).

\\textbf{GLUE Benchmark}:
- Average score: 88.4% (Full fine-tuning: 88.3%, LoRA: 87.9%)
- Parameter efficiency: 0.3% (LoRA: 0.8%, Full: 100%)
- Training time: 2.3h (LoRA: 2.1h, Full: 12.5h)

\\textbf{SQuAD v1.1}:
- Exact Match: 87.2% (Full: 87.1%, LoRA: 86.5%)
- F1 Score: 93.8% (Full: 93.7%, LoRA: 93.3%)

\\textbf{CNN/DailyMail}:
- ROUGE-L: 40.2 (Full: 40.1, LoRA: 39.5)
- Parameter count: 2.1M (LoRA: 4.3M, Full: 774M)

\\subsection{Ablation Studies}

We analyze the contribution of each component:

1. \\textit{Uniform rank allocation}: Removing adaptive allocation and using uniform $r=4$ reduces GLUE score by 1.8%, demonstrating that dynamic allocation is crucial.

2. \\textit{Without importance-based pruning}: Random pruning degrades performance by 2.3%, confirming importance scoring guides effective parameter allocation.

3. \\textit{Gradient-only importance}: Using only gradient magnitude (without $\\sigma_k$) drops performance by 0.9%, showing both magnitude and gradient are informative.

4. \\textit{Static budget}: Disabling gradual pruning and using fixed allocation from initialization reduces score by 1.2%, indicating adaptation during training is beneficial.

\\subsection{Rank Allocation Analysis}

We analyze learned rank distributions across layers. Self-attention query and value projections consistently receive higher ranks (6-8) than feed-forward layers (2-4). This aligns with findings that attention mechanisms are more task-specific while feed-forward layers learn more general features. Middle layers typically have higher ranks than early/late layers, suggesting task-specific information is primarily processed in intermediate representations.

\\section{Discussion}

AdaLoRA demonstrates that parameter-efficient fine-tuning benefits significantly from adaptive rank allocation. By treating different weight matrices according to their task-specific importance, we achieve better performance with fewer parameters than uniform approaches.

The importance scoring mechanism successfully identifies which components require higher capacity. Our analysis reveals consistent patterns: attention projections need more parameters than feed-forward layers, and middle layers are more task-specific than early layers. This knowledge could inform future architecture designs.

\\textbf{Computational Efficiency}: While AdaLoRA adds importance computation overhead (5-10% training time increase), this is negligible compared to memory savings. The ability to fine-tune large models on consumer GPUs outweighs minor training slowdowns.

\\textbf{Limitations}: Several limitations warrant discussion:
1. The method requires tuning the parameter budget hyperparameter, though we find 0.2-0.5% works well across tasks
2. Importance computation assumes gradient informativeness, which may be noisy early in training
3. Current implementation focuses on transformer architectures; extension to CNNs or other architectures requires adaptation

Future work could explore: task-agnostic importance metrics, automatic budget determination, and combinations with other PEFT methods like prefix tuning.

\\section{Conclusion}

We introduced AdaLoRA, a parameter-efficient fine-tuning method that adaptively allocates rank budgets across weight matrices based on learned importance scores. Through SVD-style parameterization and gradual pruning, AdaLoRA achieves superior performance to uniform LoRA while using 40% fewer parameters.

Extensive experiments on GLUE, SQuAD, and summarization tasks demonstrate that AdaLoRA matches or exceeds full fine-tuning performance with 0.1-0.3% trainable parameters. The method's ability to automatically identify critical model components makes it practical for adapting billion-parameter models to diverse downstream tasks.

Our work highlights the importance of adaptive capacity allocation in parameter-efficient learning. As language models continue growing, methods that intelligently distribute limited parameter budgets will be increasingly valuable for democratizing access to large-scale model adaptation.

\\section*{References}

[1] Han, S., Pool, J., Tran, J., and Dally, W. (2015). Learning both weights and connections for efficient neural network. In \\textit{Advances in Neural Information Processing Systems} (NeurIPS), pages 1135--1143.

[2] Hermann, K. M., Kocisky, T., Grefenstette, E., Espeholt, L., Kay, W., Suleyman, M., and Blunsom, P. (2015). Teaching machines to read and comprehend. In \\textit{Advances in Neural Information Processing Systems} (NeurIPS), pages 1693--1701.

[3] Houlsby, N., Giurgiu, A., Jastrzebski, S., Morrone, B., de Laroussilhe, Q., Gesmundo, A., Attariyan, M., and Gelly, S. (2019). Parameter-efficient transfer learning for NLP. In \\textit{Proceedings of the International Conference on Machine Learning} (ICML), pages 2790--2799.

[4] Hu, E. J., Shen, Y., Wallis, P., Allen-Zhu, Z., Li, Y., Wang, S., Wang, L., and Chen, W. (2021). LoRA: Low-rank adaptation of large language models. In \\textit{International Conference on Learning Representations} (ICLR).

[5] Li, X. L. and Liang, P. (2021). Prefix-tuning: Optimizing continuous prompts for generation. In \\textit{Proceedings of the Annual Meeting of the Association for Computational Linguistics} (ACL), pages 4582--4597.

[6] Li, H., Kadav, A., Durdanovic, I., Samet, H., and Graf, H. P. (2017). Pruning filters for efficient convnets. In \\textit{International Conference on Learning Representations} (ICLR).

[7] Liu, H., Simonyan, K., and Yang, Y. (2019). DARTS: Differentiable architecture search. In \\textit{International Conference on Learning Representations} (ICLR).

[8] Pfeiffer, J., Kamath, A., R\\"{u}ckl\\'{e}, A., Cho, K., and Gurevych, I. (2020). AdapterHub: A framework for adapting transformers. In \\textit{Proceedings of the Conference on Empirical Methods in Natural Language Processing} (EMNLP), pages 46--54.

[9] Rajpurkar, P., Zhang, J., Lopyrev, K., and Liang, P. (2016). SQuAD: 100,000+ questions for machine comprehension of text. In \\textit{Proceedings of the Conference on Empirical Methods in Natural Language Processing} (EMNLP), pages 2383--2392.

[10] Wang, A., Singh, A., Michael, J., Hill, F., Levy, O., and Bowman, S. R. (2018). GLUE: A multi-task benchmark and analysis platform for natural language understanding. In \\textit{International Conference on Learning Representations} (ICLR).

\\section*{Acknowledgments}

This work was supported by the National Science Foundation under Grant No. IIS-2045685 and by the Stanford Institute for Human-Centered Artificial Intelligence (HAI). We thank the anonymous reviewers for their insightful comments and suggestions. We also acknowledge computational resources provided by the Stanford Research Computing Center.`;

const MOCK_PYTHON = `"""
AdaLoRA: Adaptive Low-Rank Adaptation for Fine-Tuning Large Language Models
Implementation of adaptive rank allocation with importance-based pruning
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import matplotlib.pyplot as plt
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from torch.optim.lr_scheduler import get_linear_schedule_with_warmup
import math
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')


@dataclass
class AdaLoRAConfig:
    """Configuration for AdaLoRA"""
    rank: int = 8  # Initial rank for all matrices
    target_rank: int = 4  # Target average rank after pruning
    alpha: float = 16  # LoRA scaling factor
    dropout: float = 0.1
    pruning_start: float = 0.2  # Start pruning at 20% of training
    pruning_end: float = 0.8  # Complete pruning at 80%
    importance_ema_beta: float = 0.85  # EMA decay for importance scores


class SVDLinear(nn.Module):
    """
    SVD-parameterized low-rank adaptation layer.
    Implements: h = Wx + BAx where B, A are low-rank with explicit singular values.
    """
    
    def __init__(self, in_features: int, out_features: int, rank: int, config: AdaLoRAConfig):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.rank = rank
        self.config = config
        
        # Initialize low-rank matrices
        self.lora_A = nn.Parameter(torch.randn(rank, in_features) * 0.01)
        self.lora_B = nn.Parameter(torch.randn(out_features, rank) * 0.01)
        
        # Singular values (importance indicators)
        self.lora_S = nn.Parameter(torch.ones(rank))
        
        # Track importance scores with EMA
        self.register_buffer('importance', torch.zeros(rank))
        self.register_buffer('iters', torch.zeros(1))
        
        # Mask for pruning
        self.register_buffer('mask', torch.ones(rank))
        
        self.scaling = config.alpha / rank
        self.dropout = nn.Dropout(config.dropout)
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass with masked low-rank adaptation."""
        # Apply mask to singular values during forward pass
        masked_S = self.lora_S * self.mask
        
        # Compute low-rank update: B @ diag(S) @ A @ x
        result = self.lora_A @ x.transpose(-2, -1)  # [rank, batch, seq]
        result = masked_S.unsqueeze(1).unsqueeze(2) * result  # Apply S
        result = self.lora_B @ result  # [out, batch, seq]
        result = result.transpose(-2, -1)  # [batch, seq, out]
        
        return self.dropout(result) * self.scaling
    
    def compute_importance(self):
        """
        Compute importance scores as: I_k = |sigma_k| * ||grad_sigma_k||
        """
        if self.lora_S.grad is None:
            return
        
        # Importance = singular value magnitude * gradient magnitude
        importance = (self.lora_S.abs() * self.lora_S.grad.abs()).detach()
        
        # Update with exponential moving average
        beta = self.config.importance_ema_beta
        self.importance = beta * self.importance + (1 - beta) * importance
        self.iters += 1
    
    def prune(self, threshold: float):
        """Prune singular values below threshold."""
        # Compute bias-corrected importance estimate
        bias_corrected = self.importance / (1 - self.config.importance_ema_beta ** self.iters.item())
        
        # Update mask
        self.mask = (bias_corrected >= threshold).float()
        
        return self.mask.sum().item()  # Return active rank


class AdaLoRAModel:
    """
    Wrapper to apply AdaLoRA to a pretrained transformer model.
    Replaces specific linear layers with SVD-parameterized low-rank adaptations.
    """
    
    def __init__(self, model: nn.Module, config: AdaLoRAConfig, target_modules: List[str] = None):
        self.model = model
        self.config = config
        self.adalora_layers: List[SVDLinear] = []
        
        if target_modules is None:
            # Default: apply to query and value projections in attention
            target_modules = ['query', 'value']
        
        # Replace target linear layers with LoRA layers
        self._inject_adalora(target_modules)
        
        # Freeze all original parameters
        for name, param in model.named_parameters():
            if 'lora' not in name:
                param.requires_grad = False
    
    def _inject_adalora(self, target_modules: List[str]):
        """Inject AdaLoRA layers into the model."""
        for name, module in self.model.named_modules():
            if any(target in name for target in target_modules) and isinstance(module, nn.Linear):
                # Create AdaLoRA layer
                lora_layer = SVDLinear(
                    module.in_features,
                    module.out_features,
                    self.config.rank,
                    self.config
                )
                
                # Store the original layer and AdaLoRA layer
                self.adalora_layers.append(lora_layer)
                
                # Register as submodule
                parent_name = '.'.join(name.split('.')[:-1])
                child_name = name.split('.')[-1]
                parent = dict(self.model.named_modules())[parent_name] if parent_name else self.model
                
                # Create wrapper that combines original + LoRA
                original_forward = module.forward
                lora_layer_ref = lora_layer
                
                def new_forward(x, lora=lora_layer_ref, orig=original_forward):
                    return orig(x) + lora(x)
                
                module.forward = new_forward
                setattr(parent, child_name + '_lora', lora_layer)
    
    def compute_importance(self):
        """Compute importance scores for all AdaLoRA layers."""
        for layer in self.adalora_layers:
            layer.compute_importance()
    
    def prune(self, progress: float):
        """
        Prune low-importance components based on training progress.
        progress: float in [0, 1] indicating training completion.
        """
        if progress < self.config.pruning_start or progress > self.config.pruning_end:
            return
        
        # Compute pruning threshold with cubic schedule
        normalized_progress = (progress - self.config.pruning_start) / (
            self.config.pruning_end - self.config.pruning_start
        )
        pruning_coeff = 1 - (1 - normalized_progress) ** 3
        
        # Collect all importance scores
        all_importance = []
        for layer in self.adalora_layers:
            bias_corrected = layer.importance / (
                1 - self.config.importance_ema_beta ** layer.iters.item()
            )
            all_importance.extend(bias_corrected.tolist())
        
        # Determine threshold to achieve target rank
        if len(all_importance) > 0:
            all_importance = sorted(all_importance)
            target_params = int(len(all_importance) * (1 - pruning_coeff))
            threshold = all_importance[max(0, target_params - 1)] if target_params > 0 else 0
            
            # Prune each layer
            total_active = 0
            for layer in self.adalora_layers:
                active = layer.prune(threshold)
                total_active += active
            
            return total_active
        return 0
    
    def trainable_parameters(self):
        """Count trainable parameters."""
        return sum(p.numel() for p in self.model.parameters() if p.requires_grad)


# Simplified dataset for demonstration
class TextDataset(Dataset):
    """Simple text classification dataset."""
    def __init__(self, num_samples: int = 1000):
        self.texts = [f"Sample text {i} for classification task" for i in range(num_samples)]
        self.labels = torch.randint(0, 2, (num_samples,))  # Binary classification
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        return self.texts[idx], self.labels[idx]


def train_epoch(model, adalora_wrapper, dataloader, tokenizer, optimizer, device, progress):
    """Train for one epoch with AdaLoRA."""
    model.train()
    total_loss = 0
    correct = 0
    total = 0
    
    for batch_idx, (texts, labels) in enumerate(dataloader):
        # Tokenize
        inputs = tokenizer(texts, padding=True, truncation=True, return_tensors='pt', max_length=128)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        labels = labels.to(device)
        
        # Forward pass
        outputs = model(**inputs, labels=labels)
        loss = outputs.loss
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        
        # Compute importance scores
        adalora_wrapper.compute_importance()
        
        # Apply pruning based on progress
        adalora_wrapper.prune(progress)
        
        # Update weights
        optimizer.step()
        
        # Track metrics
        total_loss += loss.item()
        preds = outputs.logits.argmax(dim=-1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)
    
    return total_loss / len(dataloader), correct / total


def evaluate(model, dataloader, tokenizer, device):
    """Evaluate model."""
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for texts, labels in dataloader:
            inputs = tokenizer(texts, padding=True, truncation=True, return_tensors='pt', max_length=128)
            inputs = {k: v.to(device) for k, v in inputs.items()}
            labels = labels.to(device)
            
            outputs = model(**inputs, labels=labels)
            loss = outputs.loss
            
            total_loss += loss.item()
            preds = outputs.logits.argmax(dim=-1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
    
    return total_loss / len(dataloader), correct / total


def visualize_results(train_losses, val_losses, val_accs, active_ranks):
    """Visualize training progress and rank allocation."""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(14, 10))
    
    # Loss plot
    ax1.plot(train_losses, label='Train Loss', linewidth=2)
    ax1.plot(val_losses, label='Val Loss', linewidth=2)
    ax1.set_xlabel('Epoch', fontsize=12)
    ax1.set_ylabel('Loss', fontsize=12)
    ax1.set_title('Training Progress', fontsize=14, fontweight='bold')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Accuracy plot
    ax2.plot(val_accs, label='Val Accuracy', color='green', linewidth=2)
    ax2.set_xlabel('Epoch', fontsize=12)
    ax2.set_ylabel('Accuracy', fontsize=12)
    ax2.set_title('Validation Accuracy', fontsize=14, fontweight='bold')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # Active rank plot
    ax3.plot(active_ranks, label='Active Ranks', color='purple', linewidth=2)
    ax3.set_xlabel('Epoch', fontsize=12)
    ax3.set_ylabel('Average Rank', fontsize=12)
    ax3.set_title('Adaptive Rank Allocation', fontsize=14, fontweight='bold')
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    
    # Parameter efficiency
    epochs = list(range(len(train_losses)))
    ax4.text(0.5, 0.5, f'Parameter Efficiency\\nTrainable: ~0.3%\\nFrozen: ~99.7%',
             ha='center', va='center', fontsize=16, transform=ax4.transAxes)
    ax4.axis('off')
    
    plt.tight_layout()
    plt.savefig('adalora_training.png', dpi=150, bbox_inches='tight')
    print("\\nVisualization saved to 'adalora_training.png'")


def main():
    """Main training pipeline for AdaLoRA."""
    print("="*60)
    print("AdaLoRA: Adaptive Low-Rank Adaptation")
    print("="*60)
    
    # Set device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"\\nDevice: {device}")
    
    # Configuration
    config = AdaLoRAConfig(
        rank=8,
        target_rank=4,
        alpha=16,
        dropout=0.1,
        pruning_start=0.2,
        pruning_end=0.8
    )
    
    # Load pretrained model (using distilbert for speed)
    print("\\nLoading pretrained model...")
    model_name = 'distilbert-base-uncased'
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model.to(device)
    
    # Apply AdaLoRA
    print("Applying AdaLoRA...")
    adalora_wrapper = AdaLoRAModel(model, config, target_modules=['query', 'value'])
    
    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = adalora_wrapper.trainable_parameters()
    print(f"\\nTotal parameters: {total_params:,}")
    print(f"Trainable parameters: {trainable_params:,} ({100*trainable_params/total_params:.2f}%)")
    
    # Create datasets
    print("\\nCreating datasets...")
    train_dataset = TextDataset(num_samples=1000)
    val_dataset = TextDataset(num_samples=200)
    
    train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=16)
    
    # Optimizer and scheduler
    num_epochs = 20
    optimizer = AdamW([p for p in model.parameters() if p.requires_grad], lr=3e-4, weight_decay=0.01)
    total_steps = len(train_loader) * num_epochs
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=total_steps//10, num_training_steps=total_steps)
    
    # Training loop
    print(f"\\nTraining for {num_epochs} epochs...\\n")
    train_losses, val_losses, val_accs, active_ranks = [], [], [], []
    best_val_acc = 0
    
    for epoch in range(num_epochs):
        progress = (epoch + 1) / num_epochs
        
        # Train
        train_loss, train_acc = train_epoch(
            model, adalora_wrapper, train_loader, tokenizer, optimizer, device, progress
        )
        scheduler.step()
        
        # Evaluate
        val_loss, val_acc = evaluate(model, val_loader, tokenizer, device)
        
        # Track metrics
        train_losses.append(train_loss)
        val_losses.append(val_loss)
        val_accs.append(val_acc)
        
        # Compute average active rank
        avg_rank = sum(layer.mask.sum().item() for layer in adalora_wrapper.adalora_layers) / len(adalora_wrapper.adalora_layers)
        active_ranks.append(avg_rank)
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), 'adalora_best.pth')
        
        # Print progress
        if (epoch + 1) % 5 == 0:
            print(f"Epoch {epoch+1}/{num_epochs} | "
                  f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f} | "
                  f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f} | "
                  f"Avg Rank: {avg_rank:.1f}")
    
    print(f"\\nTraining completed!")
    print(f"Best validation accuracy: {best_val_acc:.4f}")
    print(f"Final average rank: {active_ranks[-1]:.1f} (started at {config.rank})")
    
    # Visualize
    visualize_results(train_losses, val_losses, val_accs, active_ranks)
    
    return model, adalora_wrapper


if __name__ == "__main__":
    model, wrapper = main()
    print("\\n" + "="*60)
    print("AdaLoRA experiment completed successfully!")
    print("="*60)
            
        Returns:
            output: Attention output [batch, seq_len, d_model]
            attention_weights: Attention weights [batch, num_heads, seq_len, seq_len]
        """
        batch_size = query.size(0)
        
        # Linear projections and reshape for multi-head
        Q = self.W_q(query).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(key).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(value).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        # Scaled dot-product attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / self.scale
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        attention_weights = F.softmax(scores, dim=-1)
        attention_weights = self.dropout(attention_weights)
        
        # Apply attention to values
        context = torch.matmul(attention_weights, V)
        
        # Concatenate heads and apply output projection
        context = context.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        output = self.W_o(context)
        
        return output, attention_weights


class FeedForward(nn.Module):
    """Position-wise feed-forward network with GELU activation."""
    
    def __init__(self, d_model: int, d_ff: int, dropout: float = 0.1):
        super().__init__()
        self.linear1 = nn.Linear(d_model, d_ff)
        self.linear2 = nn.Linear(d_ff, d_model)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Apply feed-forward transformation."""
        return self.linear2(self.dropout(F.gelu(self.linear1(x))))


class TransformerEncoderLayer(nn.Module):
    """Single transformer encoder layer with self-attention and FFN."""
    
    def __init__(self, d_model: int, num_heads: int, d_ff: int, dropout: float = 0.1):
        super().__init__()
        self.self_attention = MultiHeadAttention(d_model, num_heads, dropout)
        self.feed_forward = FeedForward(d_model, d_ff, dropout)
        
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> torch.Tensor:
        """Forward pass through encoder layer."""
        # Self-attention with residual connection
        attn_output, _ = self.self_attention(x, x, x, mask)
        x = self.norm1(x + self.dropout(attn_output))
        
        # Feed-forward with residual connection
        ff_output = self.feed_forward(x)
        x = self.norm2(x + self.dropout(ff_output))
        
        return x


class ModalityEncoder(nn.Module):
    """Transformer encoder for individual modality."""
    
    def __init__(self, input_dim: int, d_model: int, num_layers: int, 
                 num_heads: int, d_ff: int, dropout: float = 0.1):
        super().__init__()
        self.input_projection = nn.Linear(input_dim, d_model)
        self.positional_encoding = PositionalEncoding(d_model)
        
        self.layers = nn.ModuleList([
            TransformerEncoderLayer(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])
        
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> torch.Tensor:
        """Encode modality sequence."""
        x = self.input_projection(x)
        x = self.positional_encoding(x)
        x = self.dropout(x)
        
        for layer in self.layers:
            x = layer(x, mask)
        
        return x


class CrossModalAttentionFusion(nn.Module):
    """Cross-modal attention fusion module with dynamic gating."""
    
    def __init__(self, d_model: int, num_heads: int, dropout: float = 0.1):
        super().__init__()
        self.d_model = d_model
        
        # Cross-attention for each modality pair
        self.attn_tv = MultiHeadAttention(d_model, num_heads, dropout)
        self.attn_ta = MultiHeadAttention(d_model, num_heads, dropout)
        self.attn_va = MultiHeadAttention(d_model, num_heads, dropout)
        self.attn_vt = MultiHeadAttention(d_model, num_heads, dropout)
        self.attn_at = MultiHeadAttention(d_model, num_heads, dropout)
        self.attn_av = MultiHeadAttention(d_model, num_heads, dropout)
        
        # Gating network for dynamic fusion weights
        self.gate_network = nn.Sequential(
            nn.Linear(d_model * 3, d_model),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_model, 9),  # 3 self-weights + 6 cross-weights
            nn.Softmax(dim=-1)
        )
        
        self.norm = nn.LayerNorm(d_model)
    
    def forward(self, h_t: torch.Tensor, h_v: torch.Tensor, 
                h_a: torch.Tensor) -> Tuple[torch.Tensor, Dict[str, torch.Tensor]]:
        """
        Fuse representations from three modalities.
        
        Args:
            h_t: Text representation [batch, seq_t, d_model]
            h_v: Visual representation [batch, seq_v, d_model]
            h_a: Acoustic representation [batch, seq_a, d_model]
            
        Returns:
            fused: Fused representation [batch, seq, d_model]
            attention_dict: Dictionary of attention weights
        """
        # Compute cross-modal attention
        a_tv, w_tv = self.attn_tv(h_t, h_v, h_v)  # Text attending to visual
        a_ta, w_ta = self.attn_ta(h_t, h_a, h_a)  # Text attending to acoustic
        a_vt, w_vt = self.attn_vt(h_v, h_t, h_t)  # Visual attending to text
        a_va, w_va = self.attn_va(h_v, h_a, h_a)  # Visual attending to acoustic
        a_at, w_at = self.attn_at(h_a, h_t, h_t)  # Acoustic attending to text
        a_av, w_av = self.attn_av(h_a, h_v, h_v)  # Acoustic attending to visual
        
        # Compute mean representations for gating
        h_t_mean = h_t.mean(dim=1)
        h_v_mean = h_v.mean(dim=1)
        h_a_mean = h_a.mean(dim=1)
        
        # Compute dynamic fusion weights
        gate_input = torch.cat([h_t_mean, h_v_mean, h_a_mean], dim=-1)
        weights = self.gate_network(gate_input)  # [batch, 9]
        
        # Align sequences to same length (use text length as reference)
        target_len = h_t.size(1)
        if h_v.size(1) != target_len:
            h_v = F.interpolate(h_v.transpose(1, 2), size=target_len, 
                               mode='linear', align_corners=False).transpose(1, 2)
            a_tv = F.interpolate(a_tv.transpose(1, 2), size=target_len,
                                mode='linear', align_corners=False).transpose(1, 2)
        if h_a.size(1) != target_len:
            h_a = F.interpolate(h_a.transpose(1, 2), size=target_len,
                               mode='linear', align_corners=False).transpose(1, 2)
            a_ta = F.interpolate(a_ta.transpose(1, 2), size=target_len,
                                mode='linear', align_corners=False).transpose(1, 2)
        
        # Weighted fusion
        fused = (weights[:, 0:1, None] * h_t + 
                weights[:, 1:2, None] * h_v + 
                weights[:, 2:3, None] * h_a +
                weights[:, 3:4, None] * a_tv +
                weights[:, 4:5, None] * a_ta +
                weights[:, 5:6, None] * a_vt +
                weights[:, 6:7, None] * a_va +
                weights[:, 7:8, None] * a_at +
                weights[:, 8:9, None] * a_av)
        
        fused = self.norm(fused)
        
        attention_dict = {
            'tv': w_tv, 'ta': w_ta, 'vt': w_vt,
            'va': w_va, 'at': w_at, 'av': w_av,
            'weights': weights
        }
        
        return fused, attention_dict


class MultimodalSentimentModel(nn.Module):
    """Complete multimodal sentiment analysis model with CMAF."""
    
    def __init__(self, text_dim: int = 300, visual_dim: int = 47, 
                 acoustic_dim: int = 74, d_model: int = 256,
                 num_layers: int = 4, num_heads: int = 8,
                 d_ff: int = 1024, num_classes: int = 7,
                 dropout: float = 0.2, modality_dropout: float = 0.1):
        super().__init__()
        
        self.modality_dropout = modality_dropout
        
        # Individual modality encoders
        self.text_encoder = ModalityEncoder(text_dim, d_model, num_layers, 
                                           num_heads, d_ff, dropout)
        self.visual_encoder = ModalityEncoder(visual_dim, d_model, num_layers,
                                             num_heads, d_ff, dropout)
        self.acoustic_encoder = ModalityEncoder(acoustic_dim, d_model, num_layers,
                                               num_heads, d_ff, dropout)
        
        # Cross-modal fusion
        self.cmaf = CrossModalAttentionFusion(d_model, num_heads, dropout)
        
        # Classification head
        self.classifier = nn.Sequential(
            nn.Linear(d_model, d_model // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_model // 2, num_classes)
        )
    
    def forward(self, text: torch.Tensor, visual: torch.Tensor, 
                acoustic: torch.Tensor) -> Tuple[torch.Tensor, Dict]:
        """
        Forward pass through the model.
        
        Args:
            text: Text features [batch, seq_t, text_dim]
            visual: Visual features [batch, seq_v, visual_dim]
            acoustic: Acoustic features [batch, seq_a, acoustic_dim]
            
        Returns:
            logits: Class predictions [batch, num_classes]
            attention_dict: Dictionary of attention weights
        """
        # Apply modality dropout during training
        if self.training and self.modality_dropout > 0:
            if torch.rand(1).item() < self.modality_dropout:
                text = torch.zeros_like(text)
            if torch.rand(1).item() < self.modality_dropout:
                visual = torch.zeros_like(visual)
            if torch.rand(1).item() < self.modality_dropout:
                acoustic = torch.zeros_like(acoustic)
        
        # Encode each modality
        h_t = self.text_encoder(text)
        h_v = self.visual_encoder(visual)
        h_a = self.acoustic_encoder(acoustic)
        
        # Cross-modal fusion
        fused, attention_dict = self.cmaf(h_t, h_v, h_a)
        
        # Global pooling and classification
        pooled = fused.mean(dim=1)
        logits = self.classifier(pooled)
        
        return logits, attention_dict


def create_synthetic_data(num_samples: int = 1000, seq_len: int = 50) -> Dict[str, torch.Tensor]:
    """Create synthetic multimodal data for demonstration."""
    text = torch.randn(num_samples, seq_len, 300)
    visual = torch.randn(num_samples, seq_len // 2, 47)
    acoustic = torch.randn(num_samples, seq_len, 74)
    labels = torch.randint(0, 7, (num_samples,))
    
    return {'text': text, 'visual': visual, 'acoustic': acoustic, 'labels': labels}


def train_epoch(model: nn.Module, dataloader: DataLoader, 
                optimizer: torch.optim.Optimizer, criterion: nn.Module,
                device: torch.device) -> float:
    """Train for one epoch."""
    model.train()
    total_loss = 0
    
    for batch in dataloader:
        text = batch['text'].to(device)
        visual = batch['visual'].to(device)
        acoustic = batch['acoustic'].to(device)
        labels = batch['labels'].to(device)
        
        optimizer.zero_grad()
        logits, _ = model(text, visual, acoustic)
        loss = criterion(logits, labels)
        
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        
        total_loss += loss.item()
    
    return total_loss / len(dataloader)


def evaluate(model: nn.Module, dataloader: DataLoader, 
            criterion: nn.Module, device: torch.device) -> Tuple[float, float]:
    """Evaluate model on validation/test set."""
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for batch in dataloader:
            text = batch['text'].to(device)
            visual = batch['visual'].to(device)
            acoustic = batch['acoustic'].to(device)
            labels = batch['labels'].to(device)
            
            logits, _ = model(text, visual, acoustic)
            loss = criterion(logits, labels)
            
            total_loss += loss.item()
            pred = logits.argmax(dim=-1)
            correct += (pred == labels).sum().item()
            total += labels.size(0)
    
    return total_loss / len(dataloader), correct / total


def visualize_results(train_losses: list, val_losses: list, val_accs: list):
    """Visualize training progress."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    
    # Loss plot
    ax1.plot(train_losses, label='Train Loss', linewidth=2)
    ax1.plot(val_losses, label='Val Loss', linewidth=2)
    ax1.set_xlabel('Epoch', fontsize=12)
    ax1.set_ylabel('Loss', fontsize=12)
    ax1.set_title('Training and Validation Loss', fontsize=14, fontweight='bold')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Accuracy plot
    ax2.plot(val_accs, label='Val Accuracy', color='green', linewidth=2)
    ax2.set_xlabel('Epoch', fontsize=12)
    ax2.set_ylabel('Accuracy', fontsize=12)
    ax2.set_title('Validation Accuracy', fontsize=14, fontweight='bold')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('training_results.png', dpi=150, bbox_inches='tight')
    print("\\nTraining visualization saved to 'training_results.png'")


def main():
    """Main training and evaluation pipeline."""
    # Set random seed for reproducibility
    torch.manual_seed(42)
    np.random.seed(42)
    
    # Device configuration
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}\\n")
    
    # Hyperparameters
    num_epochs = 50
    batch_size = 32
    learning_rate = 2e-4
    weight_decay = 0.01
    
    # Create synthetic data
    print("Creating synthetic dataset...")
    train_data = create_synthetic_data(num_samples=1000)
    val_data = create_synthetic_data(num_samples=200)
    
    # Create data loaders
    train_dataset = torch.utils.data.TensorDataset(
        train_data['text'], train_data['visual'], 
        train_data['acoustic'], train_data['labels']
    )
    val_dataset = torch.utils.data.TensorDataset(
        val_data['text'], val_data['visual'],
        val_data['acoustic'], val_data['labels']
    )
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size)
    
    # Wrap in dictionary format
    train_loader = [{'text': t, 'visual': v, 'acoustic': a, 'labels': l} 
                   for t, v, a, l in train_loader]
    val_loader = [{'text': t, 'visual': v, 'acoustic': a, 'labels': l}
                 for t, v, a, l in val_loader]
    
    # Initialize model
    print("Initializing model...")
    model = MultimodalSentimentModel(
        text_dim=300, visual_dim=47, acoustic_dim=74,
        d_model=256, num_layers=4, num_heads=8,
        d_ff=1024, num_classes=7, dropout=0.2,
        modality_dropout=0.1
    ).to(device)
    
    total_params = sum(p.numel() for p in model.parameters())
    print(f"Total parameters: {total_params:,}\\n")
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = AdamW(model.parameters(), lr=learning_rate, weight_decay=weight_decay)
    scheduler = CosineAnnealingLR(optimizer, T_max=num_epochs)
    
    # Training loop
    print("Starting training...\\n")
    train_losses, val_losses, val_accs = [], [], []
    best_val_acc = 0
    
    for epoch in range(num_epochs):
        train_loss = train_epoch(model, train_loader, optimizer, criterion, device)
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)
        
        scheduler.step()
        
        train_losses.append(train_loss)
        val_losses.append(val_loss)
        val_accs.append(val_acc)
        
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), 'best_model.pth')
        
        if (epoch + 1) % 5 == 0:
            print(f"Epoch {epoch+1}/{num_epochs} | "
                  f"Train Loss: {train_loss:.4f} | "
                  f"Val Loss: {val_loss:.4f} | "
                  f"Val Acc: {val_acc:.4f}")
    
    print(f"\\nTraining completed!")
    print(f"Best validation accuracy: {best_val_acc:.4f}")
    
    # Visualize results
    visualize_results(train_losses, val_losses, val_accs)
    
    return model, train_losses, val_losses, val_accs


if __name__ == "__main__":
    model, train_losses, val_losses, val_accs = main()
    print("\\n" + "="*60)
    print("Experiment completed successfully!")
    print("="*60)
`;

export async function generatePaper(title, description) {
  // In development mode, return mock data immediately
  if (import.meta.env.DEV) {
    console.log('🚀 Development mode: Using mock LaTeX paper');
    // Simulate a delay to make it feel realistic
    await new Promise(resolve => setTimeout(resolve, 1500));
    return MOCK_LATEX;
  }

  const prompt = `You are an expert academic researcher. Generate a comprehensive research paper in LaTeX format for NeurIPS style.

TITLE: ${title}
FOCUS: ${description}

CRITICAL FORMAT RULES - FOLLOW EXACTLY:

HEADER FORMAT (centered):
\\begin{center}
\\textbf{\\Large ${title}}

\\vspace{0.3cm}

\\textbf{Author One}$^{1,*}$, \\textbf{Author Two}$^{1}$, \\textbf{Author Three}$^{2}$

\\vspace{0.2cm}

$^{1}$Institution One

$^{2}$Institution Two

\\vspace{0.2cm}

$^{*}$Corresponding author: email@university.edu

\\vspace{0.2cm}

\\textit{Submitted: Date | Revised: Date | Accepted: Date}
\\end{center}

\\vspace{0.4cm}

ABSOLUTELY NO:
- \\documentclass, \\usepackage, \\begin{document}, \\end{document}, \\maketitle, \\title, \\author, \\date

USE THESE:
- \\begin{center} ... \\end{center} for centering header
- \\vspace{0.Xcm} for spacing
- \\section{Title} for numbered sections (Introduction, Methods, Results, etc.)
- \\subsection{Title} for subsections  
- \\section*{Title} for unnumbered sections (Abstract, References, Acknowledgments)
- \\textbf{} for bold, \\textit{} for italic, \\Large for title size
- $ for inline math, $$ for display equations
- Citations: [Author, Year] format

STRUCTURE:
1. Centered header (as shown above)
2. \\subsection*{Abstract} - one paragraph summary
3. \\textbf{Keywords:} list
4. \\section{Introduction}
5. \\section{Related Work}
6. \\section{Methodology}
7. \\section{Experimental Setup}
8. \\section{Results}
9. \\section{Discussion}
10. \\section{Conclusion}
11. \\section*{References} - numbered [1], [2], etc.
12. \\section*{Acknowledgments}

Include 5-10 relevant equations with $$ for display math.
Make it comprehensive, technical, and publication-ready.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean the response
    text = cleanLatex(text);
    
    return text;
  } catch (error) {
    console.error('Error generating paper:', error);
    throw new Error('Failed to generate paper. Please try again.');
  }
}

export async function generatePythonCode(title, description, paperContent) {
  // In development mode, return mock data immediately
  if (import.meta.env.DEV) {
    console.log('🚀 Development mode: Using mock Python code');
    // Simulate a delay to make it feel realistic
    await new Promise(resolve => setTimeout(resolve, 1200));
    return MOCK_PYTHON;
  }

  const prompt = `You are an expert AI researcher and software engineer. Generate complete, runnable Python code to implement and run the experiment described in this research paper.

PAPER TITLE: ${title}
DESCRIPTION: ${description}

REQUIREMENTS:
- Generate a complete, runnable Python script (not a notebook)
- Use PyTorch for deep learning models
- Include all necessary imports (torch, numpy, matplotlib, etc.)
- Implement the complete model architecture described
- Include training loop, evaluation functions, and metrics
- Add proper data loading (use standard datasets like MNIST, CIFAR-10, etc.)
- Include visualization of results
- Add comprehensive docstrings and comments
- Make it production-ready with proper error handling
- The code should be self-contained and executable

IMPORTANT:
- Start directly with imports
- No markdown code blocks or explanations
- Only Python code
- Target 200-400 lines of well-structured code

Generate the complete Python implementation:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let code = response.text();
    
    // Clean up any markdown formatting
    code = code.replace(/```python\n?/g, '').replace(/```\n?/g, '');
    
    return code.trim();
  } catch (error) {
    console.error('Error generating Python code:', error);
    throw new Error('Failed to generate Python code. Please try again.');
  }
}

export async function chatWithAI(message, currentLatex, currentPython) {
  // Detect if user wants to edit paper or code
  const isCodeEdit = /code|python|implementation|experiment|script|function|class/i.test(message);
  
  let prompt;
  if (isCodeEdit && currentPython) {
    prompt = `You are an AI Agent helping to edit Python experiment code. The user wants to: "${message}".

Here is the current Python code:
${currentPython}

Respond ONLY with the complete modified Python code (no explanations, no markdown blocks).
Make sure the code is runnable and properly formatted.`;
  } else if (currentLatex) {
    prompt = `You are an AI Agent helping to edit a research paper. The user wants to: "${message}".

Here is the current LaTeX source:
${currentLatex}

If the user wants to modify the paper, respond ONLY with the complete modified LaTeX code (no explanations, no markdown blocks).
If the user asks a question, provide a helpful answer.

Critical formatting rules:
- Use \\section{} for numbered sections, \\section*{} for unnumbered
- Use \\subsection{} and \\subsection*{} appropriately
- Use \\begin{center}...\\end{center} for centering header content
- Use \\vspace{0.Xcm} for spacing between sections
- Use \\textbf{}, \\textit{} for formatting, \\Large for title size
- Use $math$ for inline and $$display math$$ for equations
- Keep the NeurIPS paper style with centered header
- NO \\documentclass, \\usepackage, \\begin{document}, \\maketitle commands`;
  } else {
    prompt = message;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean the response if it's code or LaTeX
    if (text.includes('\\section') || text.includes('\\subsection')) {
      text = cleanLatex(text);
    } else if (text.includes('import ') || text.includes('def ')) {
      text = text.replace(/```python\n?/g, '').replace(/```\n?/g, '');
    }
    
    return text.trim();
  } catch (error) {
    console.error('Error in chat:', error);
    throw new Error('Failed to process your request. Please try again.');
  }
}

function cleanLatex(latex) {
  // Remove markdown code blocks
  latex = latex.replace(/```latex\n?/g, '').replace(/```\n?/g, '');
  
  // Remove only document preamble commands that aren't needed
  latex = latex.replace(/\\documentclass\{[^}]*\}/g, '');
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{[^}]*\}/g, '');
  latex = latex.replace(/\\geometry\{[^}]*\}/g, '');
  latex = latex.replace(/\\title\{[^}]*\}/g, '');
  latex = latex.replace(/\\author\{[^}]*\}/g, '');
  latex = latex.replace(/\\date\{[^}]*\}/g, '');
  latex = latex.replace(/\\begin\{document\}/g, '');
  latex = latex.replace(/\\end\{document\}/g, '');
  latex = latex.replace(/\\maketitle/g, '');
  
  // Keep center, vspace, and other formatting commands as they should work
  // Only remove \noindent as it's often redundant
  latex = latex.replace(/\\noindent/g, '');
  
  return latex.trim();
}
